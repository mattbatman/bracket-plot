import * as Plot from "@observablehq/plot";
import data from "../data/bracket.json";

function indent() {
  return (root: any) => {
    root.eachBefore((node: any, i: any) => {
      node.y = node.depth;
      node.x = i;
    });
  };
}

const bracket = [
  {
    team: "Connecticut",
    path: "Connecticut",
  },
  {
    path: "Connecticut|Connecticut",
    team: "Connecticut",
  },
  {
    path: "Connecticut|Illinois",
    team: "Illinois",
  },
  {
    path: "Connecticut|Connecticut|Connecticut",
    team: "Connecticut",
  },
  {
    path: "Connecticut|Connecticut|San Diego St",
    team: "San Diego St",
  },
  {
    path: "Connecticut|Illinois|Illinois",
    team: "Illinois",
  },
  {
    path: "Connecticut|Illinois|Iowa St",
    team: "Iowa St",
  },
  /*
  {
    path: "Connecticut|Connecticut|Connecticut",
    team: "Connecticut",
  },
  {
    path: "Connecticut|Connecticut|Northwestern",
    team: "Northwestern",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|San Diego St",
    team: "San Diego St",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|Yale",
    team: "Yale",
  },
  {
    path: "Connecticut|Illinois|Illinois|Illinois",
    team: "Illinois",
  },
  {
    path: "Connecticut|Illinois|Illinois|Duquesne",
    team: "Duquesne",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Iowa St",
    team: "Iowa St",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Washington St",
    team: "Washington St",
  },
  {
    path: "Connecticut|Connecticut|Connecticut|Connecticut",
    team: "Connecticut",
  },
  {
    path: "Connecticut|Connecticut|Connecticut|Stetson",
    team: "Stetson",
  },
  {
    path: "Connecticut|Connecticut|Northwestern|Northwestern",
    team: "Northwestern",
  },
  {
    path: "Connecticut|Connecticut|Northwestern|FL Atlantic",
    team: "FL Atlantic",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|San Diego St|San Diego St",
    team: "San Diego St",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|San Diego St|UAB",
    team: "UAB",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|Yale|Yale",
    team: "Yale",
  },
  {
    path: "Connecticut|Connecticut|San Diego St|Yale|Auburn",
    team: "Auburn",
  },
  {
    path: "Connecticut|Illinois|Illinois|Duquesne|Duquesne",
    team: "Duquesne",
  },
  {
    path: "Connecticut|Illinois|Illinois|Duquesne|BYU",
    team: "BYU",
  },
  {
    path: "Connecticut|Illinois|Illinois|Illinois|Illinois",
    team: "Illinois",
  },
  {
    path: "Connecticut|Illinois|Illinois|Illinois|Morehead St",
    team: "Morehead St",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Iowa St|Iowa St",
    team: "Iowa St",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Iowa St|S Dakota St",
    team: "S Dakota St",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Washington St|Washington St",
    team: "Washington St",
  },
  {
    path: "Connecticut|Illinois|Iowa St|Washington St|Drake",
    team: "Drake",
  },
  */
];

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

console.log(nodes);

const plot = Plot.plot({
  axis: null,
  inset: 10,
  insetRight: 120,
  round: true,
  width: 800,
  height: 600,
  marks: Plot.tree(nodes, {
    path: "path",
    delimiter: "|",
    //    treeLayout: indent,
    strokeWidth: 1,
    curve: "step-before",
    textStroke: "none",
    text: "team",
  }),
});

if (div) {
  div.appendChild(plot);
}