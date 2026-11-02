import { useEffect, useRef, useState } from "react";
import { PLAYER_O, PLAYER_X, Square } from "./Square";

const BOARD_SIDES = 3;
const BOARD_INDICES = [...Array(BOARD_SIDES).keys()];
const CELL_COUNT = BOARD_SIDES * BOARD_SIDES;
const STORAGE_KEY = "tictactoe-game-v1";

function getInitialGameState() {
    const initialState = {
        status: new Array(CELL_COUNT).fill(undefined),
        winner: undefined,
        score: { [PLAYER_X]: 0, [PLAYER_O]: 0 },
        gameOver: false,
        lastCell: undefined,
        lastPlayer: undefined,
    };

    try {
        const savedGame = localStorage.getItem(STORAGE_KEY);
        if (!savedGame) return initialState;

        const parsed = JSON.parse(savedGame);
        const validPlayer = (player) => player === PLAYER_X || player === PLAYER_O;
        const validStatus =
            Array.isArray(parsed.status) &&
            parsed.status.length === CELL_COUNT &&
            parsed.status.every((cell) => cell === null || validPlayer(cell));
        const validScore =
            parsed.score &&
            Number.isInteger(parsed.score[PLAYER_X]) &&
            parsed.score[PLAYER_X] >= 0 &&
            Number.isInteger(parsed.score[PLAYER_O]) &&
            parsed.score[PLAYER_O] >= 0;
        const validLastCell =
            parsed.lastCell === null ||
            (Number.isInteger(parsed.lastCell) &&
                parsed.lastCell >= 0 &&
                parsed.lastCell < CELL_COUNT);

        if (
            !validStatus ||
            !validScore ||
            (parsed.winner !== null && !validPlayer(parsed.winner)) ||
            typeof parsed.gameOver !== "boolean" ||
            !validLastCell ||
            (parsed.lastPlayer !== null && !validPlayer(parsed.lastPlayer))
        ) {
            console.error("Saved Tic Tac Toe game data is invalid.");
            return initialState;
        }

        return {
            status: parsed.status.map((cell) => cell ?? undefined),
            winner: parsed.winner ?? undefined,
            score: parsed.score,
            gameOver: parsed.gameOver,
            lastCell: parsed.lastCell ?? undefined,
            lastPlayer: parsed.lastPlayer ?? undefined,
        };
    } catch (error) {
        console.error("Could not load the saved Tic Tac Toe game.", error);
        return initialState;
    }
}

const WIN_POSITIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export function Board() {
    const [initialState] = useState(getInitialGameState);
    const [status, setStatus] = useState(initialState.status);
    const [winner, setWinner] = useState(initialState.winner);
    const [score, setScore] = useState(initialState.score);
    const [gameOver, setGameOver] = useState(initialState.gameOver);
    const [lastCell, setLastCell] = useState(initialState.lastCell);
    const lastPlayer = useRef(initialState.lastPlayer);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    status,
                    winner: winner ?? null,
                    score,
                    gameOver,
                    lastCell: lastCell ?? null,
                    lastPlayer: lastPlayer.current ?? null,
                }),
            );
        } catch (error) {
            console.error("Could not save the Tic Tac Toe game.", error);
        }
    }, [status, winner, score, gameOver, lastCell]);

    // Update the game status, ignore the click when it is not allowed
    //  - idx: index of the square
    //  - player: left or right mouse button
    function handleClick(idx, player) {
        // ignore the invalid players (to make it foolproof)
        if (player !== PLAYER_O && player !== PLAYER_X) return;
        // ignore the repeated steps
        if (lastPlayer.current === player) return;

        // ignore the occupied cells
        if (status[idx]) return;

        // Ignore moves after a win or a draw.
        if (gameOver) return;

        // update the status
        lastPlayer.current = player;
        const newStatus = status.map((value, index) => (index === idx ? player : value));
        win_check(newStatus, player);
        console.log(newStatus);
        setStatus(newStatus);
        setLastCell(idx);
    }

    function win_check(newStatus, player) {
        const win_array = WIN_POSITIONS.map((pos) => {
            const c1 = newStatus[pos[0]];
            const c2 = newStatus[pos[1]];
            const c3 = newStatus[pos[2]];
            return c1 && c1 === c2 && c1 === c3 ? true : false;
        });
        console.log(newStatus, win_array);
        const isGameOver = win_array.some((value) => value);
        if (isGameOver) {
            setWinner(player);
            setGameOver(true);
            setScore((currentScore) => ({
                ...currentScore,
                [player]: currentScore[player] + 1,
            }));
            return;
        }
        if (newStatus.every((cell) => cell)) {
            setGameOver(true);
        }
    }

    function handlePlayAgain() {
        setStatus(new Array(CELL_COUNT).fill(undefined));
        setWinner(undefined);
        setGameOver(false);
        setLastCell(undefined);
        lastPlayer.current = undefined;
    }

    return (
        <div className="board">
            <div className="score">
                Points X: {score[PLAYER_X]} | O: {score[PLAYER_O]}
            </div>
            {BOARD_INDICES.map((rowIndex) => (
                <div className="board-row" key={rowIndex}>
                    {BOARD_INDICES.map((columnIndex) => {
                        const index = rowIndex * BOARD_SIDES + columnIndex;
                        return (
                            <Square
                                key={index}
                                value={status[index]}
                                highlight={index === lastCell}
                                onSquareClick={(player) => handleClick(index, player)}
                            />
                        );
                    })}
                </div>
            ))}
            {gameOver && winner && <div>Game over! {winner} won</div>}
            {gameOver && !winner && <div>Draw! No winner</div>}
            {gameOver && <button onClick={handlePlayAgain}>Reset</button>}
        </div>
    );
}
