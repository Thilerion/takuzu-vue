# Takuzu

Takuzu is a binary logic puzzle game, often referred to as Binairo. The game involves filling a grid with zeros ('0') and ones ('1') while adhering to three simple rules: no three consecutive numbers can be identical, each row and each column must contain an equal number of zeros and ones, and each row and each column must be unique.

This web version of Takuzu brings the classic paper and pencil game to your browser, featuring multiple difficulty levels, a variety of grid sizes, and a user-friendly interface that both beginners and experienced players can enjoy.

<div align="center">
	<a href="https://takuzu-vue.surge.sh" target="_blank" rel="noopener">
    	View the live demo here
	</a>
</div>

## Key Features

- **Multiple Difficulty Levels**: The game includes a range of difficulty settings that are designed to mimic the logical progression a human player might take, offering a natural and intuitive challenge gradient to players of all skill levels.
- **Variety of Grid Sizes**: Players can choose from traditional square grids ranging from 6x6 to 14x14, unique rectangular grids from 6x10 to 12x16, and odd-sized grids from 7x7 to 13x13 with an alternate rule. The inclusion of oblong/rectangular grids is a unique innovation not found in other binary puzzle apps, and enables playing larger puzzles on mobile devices.
- **Smart Hint System**: Features an advanced hint system that employs strategies similar to those a player might use, providing a helpful and educational tool that enhances learning and gameplay effectiveness.
- **Validation System**: Equipped with a robust validation mechanism that allows checking for both rule violations and miscellaneous mistakes, helping ensure a smooth and frustration-free gaming experience.
- **Comprehensive Statistics**: Includes a detailed statistics page that records data from every puzzle played, stored locally using IndexedDB. After completing a puzzle, players can view a recap featuring interesting statistics about their performance.
- **Multiple Puzzle Themes**: Players can customize their gaming experience with multiple thematic options, including the classic binary digits (0 and 1), tic-tac-toe symbols (O and X), and colored tiles (red and blue).
- **Mobile-Friendly Design**: The game is fully responsive, ensuring a seamless experience on mobile devices.
- **Offline Support as PWA**: Can be installed locally as a progressive web app, allowing the game to be played while offline.
- **Multilingual Support**: Available in both English and Dutch.
- **Light and Dark Mode**
- **Autosave and Reload**


## Technologies

This project was created with:

- **TypeScript**
- **Vue.js 3**
- **Pinia**: The official state management library for Vue.js.
- **Vue Router**: Used for handling navigation within the application.
- **Vue I18n**: An internationalization plugin for Vue.js.
- **IndexedDB/Dexie**: Utilized for storing game statistics.
- **Vite**
- **Tailwind CSS**

## Installation and Setup

### Clone repository

```
git clone https://github.com/Thilerion/takuzu-vue.git
cd takuzu-vue
```

### Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
pnpm run dev
```

### Compiles and minifies for production

```
pnpm run build
```

## Project Status

<!-- Current status of the project, future plans, etc. -->

## Challenges and Learning

<!-- Discussion of challenges faced and learnings acquired during the project -->

## Contact

<!-- Your contact information or links to your social media profiles -->