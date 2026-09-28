{ pkgs ? import <nixpkgs> { } }:

let
  python = pkgs.python313;
in
pkgs.mkShell {
  packages = [ python pkgs.uv ];

  # Use the Nix-provided Python instead of uv-downloaded binaries
  # (those are dynamically linked and often break on NixOS).
  UV_PYTHON = "${python}/bin/python";
  UV_PYTHON_DOWNLOADS = "never";
  UV_PYTHON_PREFERENCE = "only-system";

  # Lets prebuilt wheels with native code (uvloop, httptools, ...)
  # find libstdc++ / zlib on NixOS.
  LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
    pkgs.stdenv.cc.cc.lib
    pkgs.zlib
  ];

  shellHook = ''
    uv sync
    source .venv/bin/activate
  '';
}