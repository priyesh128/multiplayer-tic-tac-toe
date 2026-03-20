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

  private static gameStarted: boolean = false;
  private static playerAssigned: boolean = false;

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

    // 🎮 ROOM CREATED
    this.socket.on("roomCreated", (roomId: string) => {
      console.log("Room:", roomId);
      this.uiManager?.updateRoomId(roomId);
    });

    // 🎮 START GAME (FIXED)
    this.socket.on("startGame", () => {
      if (this.gameStarted) return;

      this.gameStarted = true;

      console.log("Game Start!");

      if (director.getScene().name !== "GameScene") {
        director.loadScene("GameScene");
      }
    });

    // 🎮 ASSIGN PLAYER (FIXED)
    this.socket.on("assignPlayer", (symbol: string) => {
      if (this.playerAssigned) return;

      this.playerAssigned = true;

      this.playerSymbol = symbol;

      console.log("I am Player:", symbol);

      this.isMyTurn = symbol === "X";
    });

    // 🎮 OPPONENT MOVE
    this.socket.on("opponentMove", (data: any) => {
      if (!this.gameManager) return;

      console.log("Opponent moved:", data.cellIndex);

      this.gameManager.makeOpponentMove(data.cellIndex);

      this.isMyTurn = true;
      this.gameManager.updateTurnUI();
    });

    // 🔁 RESTART GAME
    this.socket.on("restartGame", () => {
      console.log("Restarting game...");

      this.gameStarted = false;
      this.playerAssigned = false;

      this.gameManager?.resetGame();
    });
  }

  // 🎮 MAKE MOVE
  static makeMove(cellIndex: number) {
    if (!this.socket) return;

    if (!this.isMyTurn) {
      console.log("Not your turn!");
      return;
    }

    if (this.gameManager?.gameOver) return;

    this.socket.emit("makeMove", { cellIndex });

    this.isMyTurn = false;

    this.gameManager.makeMove(cellIndex);
    this.gameManager.updateTurnUI();
  }

  // 🎮 CREATE ROOM
  static createRoom() {
    if (!this.socket) {
      console.log("Not connected yet!");
      return;
    }

    this.socket.emit("createRoom");
  }

  // 🎮 JOIN ROOM
  static joinRoom(roomId: string) {
    if (!this.socket) {
      console.log("Not connected yet!");
      return;
    }

    this.socket.emit("joinRoom", roomId);
  }

  // 🔁 RESTART
  static restartGame() {
    if (!this.socket) return;

    this.socket.emit("restartGame");
  }
}
