import { useState } from "react";
import "./App.css";
import Board from "./components/Board.jsx";
import Square from "./components/Square.jsx";

function App() {
    return (
        <div className="Board">
            <Board />
        </div>
    );
}

export default App;
