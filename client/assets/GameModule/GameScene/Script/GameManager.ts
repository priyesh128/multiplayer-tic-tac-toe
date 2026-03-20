import { _decorator, Component, EventTouch, Label, Node } from "cc";
import { NetworkManager } from "../../MainScene/Script/NetworkManager";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Label)
  turnLabel: Label = null;

  @property([Label])
  cells: Label[] = [];

  @property(Node)
  restartButton: Node = null;

  board: string[] = ["", "", "", "", "", "", "", "", ""];

  gameOver: boolean = false;

  start() {
    NetworkManager.setGameManager(this);

    this.updateTurnUI();
  }
  updateTurnUI() {
    if (this.gameOver) return;

    if (NetworkManager.isMyTurn) {
      this.turnLabel.string = "Your Turn";
    } else {
      this.turnLabel.string = "Opponent Turn";
    }
  }

  // ✅ My move
  makeMove(index: number) {
    if (this.cells[index].string !== "") return;

    const symbol = NetworkManager.playerSymbol;

    this.cells[index].string = NetworkManager.playerSymbol;
    this.board[index] = symbol;

    this.checkGameResult(symbol);
  }

  // ✅ Opponent move
  makeOpponentMove(index: number) {
    if (this.cells[index].string !== "") return;

    const opponent = NetworkManager.playerSymbol === "X" ? "O" : "X";

    this.cells[index].string = opponent;
    this.board[index] = opponent;

    this.checkGameResult(opponent);
  }

  // ✅ Cell click
  onCellClick(event: EventTouch) {
    if (this.gameOver) return;

    const node = event.target as any;
    const index = parseInt(node.name);

    NetworkManager.makeMove(index);
  }
  checkGameResult(symbol: string) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      if (
        this.board[pattern[0]] === symbol &&
        this.board[pattern[1]] === symbol &&
        this.board[pattern[2]] === symbol
      ) {
        this.showResult(symbol); // ✅ change
        return;
      }
    }

    if (this.board.indexOf("") === -1) {
      this.showResult("draw"); // ✅ draw case
    }
  }
  showResult(result: string) {
    this.gameOver = true; // must be first

    this.restartButton.active = true;

    if (result === "draw") {
      this.turnLabel.string = "Match Draw";
      return;
    }

    if (result === NetworkManager.playerSymbol) {
      this.turnLabel.string = "You Win";
    } else {
      this.turnLabel.string = "You Lose";
    }
  }
  resetGame() {
    this.restartButton.active = false;

    this.gameOver = false;

    this.board = ["", "", "", "", "", "", "", "", ""];

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].string = "";
    }

    // X always starts first
    NetworkManager.isMyTurn = NetworkManager.playerSymbol === "X";

    this.updateTurnUI();
  }
  onRestartClick() {
    if (!this.gameOver) return;

    NetworkManager.restartGame();
  }
}
