const StartButton = ({ onClick }) => {
    return (
        <div id="game-controls">
            <button id="start-button" onClick={onClick}>
                Start
            </button>
        </div>
    );
}

export default StartButton;