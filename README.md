# Noctuary — A Secret Journal

A private ten-page digital journal by **Rohini Ray**. Dress the cover with
stars, flowers, and charms. Write secrets that stay on your device. Share
only if you choose, with a one-time encrypted link.

© 2026 Rohini Ray. All rights reserved.

## Idea

Read [IDEA.md](IDEA.md) for the product story and copyright notice.

## Open locally

Open `index.html` in a browser, or from this folder:

```bash
python -m http.server 5173
```

Then visit `http://localhost:5173`.

## Privacy

- Journal pages are saved in your browser (`localStorage`).
- They are not sent to a server.
- A share link encrypts a snapshot with the Web Crypto API and puts the
  payload in the URL hash, so the secret is not stored in a database.

## License

See [LICENSE](LICENSE).
