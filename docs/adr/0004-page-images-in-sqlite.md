# 4. Page images in SQLite

- Status: accepted
- Date: 2026-10-15
- Issue: #46
- Related: [[architecture/database]], [[adr/0003-sqlite-database]]

## Context

Results history (#46) shows a past result on the page it was read from, with a box on each digit. So the backend has to keep every page image the web app sends, next to what the model read. Until now it stored no files.

## Decision

- Keep each image in the `image` column of the `recognitions` table, with what the model read.
- The column is deferred, so listing the history never loads the images.
- `GET /recognitions/{id}/image` serves the image only to its owner, with `Cache-Control: no-store`, so a browser shared by two accounts can't show one account's page to the other.

## Consequences

- One file holds everything. Deleting `backend/data/` resets it, and deleting a user deletes their pages.
- No image files can be left behind without a row, or rows left without their image.
- The database grows with every page: a 3 MB phone photo adds 3 MB. That's fine on a laptop. With many users we'd move the images to a folder or object storage and keep only a path in the row.
