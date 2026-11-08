# May Myint Myat — Personal Portfolio

A light, minimal portfolio website built with HTML, CSS, and JavaScript. It can be opened locally or published with GitHub Pages. It does not need a backend.

## Preview

Open `index.html` in a browser, or run a local server from this folder:

```bash
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

## Folder guide

```text
personal-portfolio/
├── index.html          Page content
├── css/style.css       Layout, color, and motion
├── js/script.js        Menu, scrolling, and fade-in
└── assets/images/      Portrait, favicon, and project images
```

## Replace the portrait

The current portrait is `assets/images/profile.jpg`. Replace that file with your photo, or change the `src` in the hero section of `index.html`.

## Project screenshots

Each project card has its own screenshot carousel. Images are stored in `assets/images/projects/` and came from the `screenshots/` folder in each GitHub repository.

The Fitness Tracker progress file is named `progess.png` in the repository, so the local file is `fitness-tracker/progess.jpg`.

## Contact links

Email uses `mailto:maymyintmyat03@gmail.com`. GitHub points to `https://github.com/EvelynMay03`. LinkedIn points to `https://www.linkedin.com/in/may-myint-myat-ba4422446` and opens in a new tab.

## GitHub Pages

Publish the **contents of this folder** so `index.html` is at the repository root.

1. Create a GitHub repository.
2. Upload these files (`index.html`, `css`, `js`, `assets`, and this README).
3. In the repository, open Settings → Pages.
4. Deploy from the `main` branch and the `/ (root)` folder.

The live site will be `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

## How the code fits together

`index.html` holds the words and the order of the page: navigation, hero, about, projects, skills, education, and contact.

`css/style.css` controls the look. Colors live in `:root` at the top. The gray page background and the white centered sheet are set on `body` and `.page-shell`. Sections stack in one column on a phone and become side-by-side layouts at wider widths.

`js/script.js` does four small jobs: open and close the mobile menu, scroll smoothly to each section, highlight the nav link for the section in view, and fade sections in as you scroll. If someone prefers reduced motion, those movements are turned off.
