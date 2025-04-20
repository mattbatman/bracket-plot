import * as Plot from "@observablehq/plot";
import data from "../data/bracket.json";

const div = document.querySelector("#app");

const groupedByConference = data.reduce(function (acc, cv) {
  const winningConf = cv.winning_team_seed[0];
  const losingConf = cv.losing_team_seed[0];

  if (winningConf === losingConf) {
    if (!acc[winningConf]) {
      acc[winningConf] = [];
    }

    acc[winningConf].push(cv);
  }

  return acc;
}, {});

const W = groupedByConference.W;
W.sort((a, b) => b.day_number - a.day_number);

const days = W.map(({ day_number }) => day_number);
const uniqueDays = [...new Set(days)];
uniqueDays.sort((a, b) => b - a);

const nodesInGames = uniqueDays.reduce(function (acc, cv, i) {
  if (i === 0) {
    return acc.map(function (game) {
      return cv === game.day_number
        ? {
            ...game,
            winningPath: `${game.winning_team_name}|${game.winning_team_name}`,
            losingPath: `${game.winning_team_name}|${game.losing_team_name}`,
          }
        : game;
    });
  }

  if (i === 1 || i === 2) {
    return acc.map(function (game) {
      if (cv === game.day_number) {
        const previousDayNumber = uniqueDays[i - 1];

        const winningFind = acc
          .filter(({ day_number }) => day_number === previousDayNumber)
          .find(function (gameK) {
            return gameK.winning_team_name === game.winning_team_name;
          });

        const losingFind = acc
          .filter(({ day_number }) => day_number === previousDayNumber)
          .find(function (gameK) {
            return gameK.losing_team_name === game.winning_team_name;
          });

        let previousPath = "";

        if (winningFind) {
          previousPath = winningFind.winningPath;
        }

        if (losingFind) {
          previousPath = losingFind.losingPath;
        }

        return {
          ...game,
          winningPath: `${previousPath}|${game.winning_team_name}`,
          losingPath: `${previousPath}|${game.losing_team_name}`,
        };
      }

      return game;
    });
  }

  return acc.map(function (game) {
    if (cv === game.day_number) {
      const previousDayNumber = uniqueDays[i - 1];
      const otherPreviousDayNumber = uniqueDays[i - 2];

      const winningFind = acc
        .filter(
          ({ day_number }) =>
            day_number === previousDayNumber ||
            day_number === otherPreviousDayNumber
        )
        .find(function (gameK) {
          return gameK.winning_team_name === game.winning_team_name;
        });

      const losingFind = acc
        .filter(
          ({ day_number }) =>
            day_number === previousDayNumber ||
            day_number === otherPreviousDayNumber
        )
        .find(function (gameK) {
          return gameK.losing_team_name === game.winning_team_name;
        });

      let previousPath = "";

      if (winningFind) {
        previousPath = winningFind.winningPath;
      }

      if (losingFind) {
        previousPath = losingFind.losingPath;
      }

      return {
        ...game,
        winningPath: `${previousPath}|${game.winning_team_name}`,
        losingPath: `${previousPath}|${game.losing_team_name}`,
      };
    }

    return game;
  });
}, W);

const nodes = nodesInGames.reduce(function (acc, cv, i) {
  acc.push({
    path: cv.winningPath,
    team: cv.winning_team_name,
  });

  acc.push({
    path: cv.losingPath,
    team: cv.losing_team_name,
  });

  return acc;
}, []);

const { winning_team_name: champion } = nodesInGames[0];

nodes.push({
  team: champion,
  path: champion,
});

const plot = Plot.plot({
  axis: null,
  inset: 120,
  round: true,
  width: 800,
  height: 600,
  marks: Plot.tree(nodes, {
    path: "path",
    delimiter: "|",
    strokeWidth: 1,
    curve: "step-before",
    textStroke: "none",
    text: "team",
  }),
});

if (div) {
  div.appendChild(plot);
}