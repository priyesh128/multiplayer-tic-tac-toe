import { Socket } from "socket.io-client";
import io from "socket.io-client/dist/socket.io.js";
import { GameManager } from "../../GameScene/Script/GameManager";
import { director } from "cc";
import { UIManager } from "./UIManager";

export class NetworkManager {
  private static socket: Socket;
  private static gameManager: GameManager;
  private static uiManager: UIManager;
  static playerSymbol: string = "";
  static isMyTurn: boolean = false;

  static setGameManager(manager: GameManager) {
    this.gameManager = manager;
  }
  static setUIManager(manager: UIManager) {
    this.uiManager = manager;
  }

  static connect() {
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Connected:", this.socket.id);
    });

    this.socket.on("roomCreated", (roomId: string) => {
      console.log("Room:", roomId);
      this.uiManager.updateRoomId(roomId);
    });

    this.socket.on("startGame", () => {
      console.log("Game Start!");
      director.loadScene("GameScene");
    });

    this.socket.on("assignPlayer", (symbol: string) => {
      this.playerSymbol = symbol;

      console.log("I am Player:", symbol);

      // X starts first
      this.isMyTurn = symbol === "X";
    });
    // ✅ ADD THIS HERE
    this.socket.on("opponentMove", (data: any) => {
      console.log("Opponent moved:", data.cellIndex);
      this.gameManager.makeOpponentMove(data.cellIndex);
      this.isMyTurn = true;
      this.gameManager.updateTurnUI();
    });

    this.socket.on("restartGame", () => {
      console.log("Restarting game...");
      this.gameManager.resetGame();
    });
  }

  // ✅ ADD THIS FUNCTION
  static makeMove(cellIndex: number) {
    if (!this.socket) return;

    if (!this.isMyTurn) {
      console.log("Not your turn!");
      return;
    }

    if (this.gameManager.gameOver) return; // ✅ stop

    this.socket.emit("makeMove", { cellIndex });

    this.isMyTurn = false;

    this.gameManager.makeMove(cellIndex);
    this.gameManager.updateTurnUI();
  }

  static createRoom() {
    if (!this.socket) {
      console.log("Not connected yet!");
      return;
    }

    this.socket.emit("createRoom");
  }

  static joinRoom(roomId: string) {
    if (!this.socket) {
      console.log("Not connected yet!");
      return;
    }

    this.socket.emit("joinRoom", roomId);
  }
  static restartGame() {
    if (!this.socket) return;

    this.socket.emit("restartGame");
  }
}
