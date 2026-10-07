from app.auth.router import (
    COOKIE_NAME,
    ERROR_401,
    ERROR_401_CREDENTIALS,
    ERROR_409,
)
from app.auth.service import ERROR_EMAIL, ERROR_PASSWORD

ADA = {"email": "ada@example.com", "password": "correct horse"}


def sign_up(client, credentials=ADA):
    return client.post("/auth/sign-up", json=credentials)


def test_sign_up_returns_the_user_and_sets_a_session_cookie(client):
    response = sign_up(client)

    assert response.status_code == 201
    assert set(response.json()) == {"id", "email", "first_name", "last_name"}
    assert response.json()["email"] == "ada@example.com"

    cookie = response.headers["set-cookie"]
    assert cookie.startswith(f"{COOKIE_NAME}=")
    assert "HttpOnly" in cookie
    assert "SameSite=lax" in cookie
    assert "Max-Age=604800" in cookie
    assert "Path=/" in cookie


def test_names_are_optional_at_sign_up(client):
    body = sign_up(client).json()
    assert (body["first_name"], body["last_name"]) == (None, None)


def test_me_returns_the_names_given_at_sign_up(client):
    sign_up(client, {**ADA, "first_name": "Ada", "last_name": "Lovelace"})

    me = client.get("/auth/me").json()

    assert (me["first_name"], me["last_name"]) == ("Ada", "Lovelace")


def test_sign_up_with_a_name_over_100_characters_is_422(client):
    response = sign_up(client, {**ADA, "first_name": "A" * 101})
    assert response.status_code == 422


def test_me_returns_the_signed_in_user(client):
    user = sign_up(client).json()

    response = client.get("/auth/me")

    assert response.status_code == 200
    assert response.json() == user


def test_me_without_a_cookie_is_401(client):
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": ERROR_401}


def test_me_with_a_stale_cookie_is_401_and_clears_it(client):
    client.cookies.set(COOKIE_NAME, "made-up")

    response = client.get("/auth/me")

    assert response.status_code == 401
    assert f'{COOKIE_NAME}=""' in response.headers["set-cookie"]
    assert "Max-Age=0" in response.headers["set-cookie"]


def test_sign_out_ends_the_session_and_clears_the_cookie(client):
    sign_up(client)
    token = client.cookies[COOKIE_NAME]

    response = client.post("/auth/sign-out")

    assert response.status_code == 204
    assert "Max-Age=0" in response.headers["set-cookie"]
    client.cookies.set(COOKIE_NAME, token)
    assert client.get("/auth/me").status_code == 401


def test_sign_out_without_a_session_still_works(client):
    assert client.post("/auth/sign-out").status_code == 204


def test_sign_in_with_the_right_password(client):
    user = sign_up(client).json()
    client.cookies.clear()

    response = client.post(
        "/auth/sign-in", json={"email": "ADA@example.com", "password": "correct horse"}
    )

    assert response.status_code == 200
    assert response.json() == user
    assert client.get("/auth/me").json() == user


def test_sign_in_with_a_wrong_password_is_401_without_a_cookie(client):
    sign_up(client)
    client.cookies.clear()

    response = client.post(
        "/auth/sign-in", json={"email": "ada@example.com", "password": "wrong horse"}
    )

    assert response.status_code == 401
    assert response.json() == {"detail": ERROR_401_CREDENTIALS}
    assert "set-cookie" not in response.headers


def test_sign_in_with_an_unknown_email_gives_the_same_answer(client):
    response = client.post("/auth/sign-in", json=ADA)

    assert response.status_code == 401
    assert response.json() == {"detail": ERROR_401_CREDENTIALS}


def test_sign_up_twice_with_one_email_is_409(client):
    sign_up(client)
    response = sign_up(client, {**ADA, "email": "Ada@Example.com"})

    assert response.status_code == 409
    assert response.json() == {"detail": ERROR_409}


def test_sign_up_with_a_bad_email_is_400(client):
    response = sign_up(client, {**ADA, "email": "ada"})

    assert response.status_code == 400
    assert response.json() == {"detail": ERROR_EMAIL}


def test_sign_up_with_a_short_password_is_400(client):
    response = sign_up(client, {**ADA, "password": "short"})

    assert response.status_code == 400
    assert response.json() == {"detail": ERROR_PASSWORD}


def test_sign_up_without_a_password_is_422(client):
    response = client.post("/auth/sign-up", json={"email": "ada@example.com"})
    assert response.status_code == 422
