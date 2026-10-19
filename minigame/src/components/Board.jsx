import { useState } from "react";
import { Square } from "./Square";
export function Board() {
    const [gameStatus] = useState([1, 2, 3]);
    return (
        <div className="board">
            <div className="board-row">
                <Square value={gameStatus[0]} />
                <Square value={gameStatus[1]} />
                <Square value={gameStatus[2]} />
            </div>
        </div>
    );
}
