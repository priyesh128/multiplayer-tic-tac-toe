import { _decorator, Component, EditBox, Label, randomRangeInt } from "cc";
import { NetworkManager } from "./NetworkManager";

const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
  @property(EditBox)
  roomInput: EditBox = null!;

  @property(Label)
  roomIdLabel: Label = null!;

  start() {
    NetworkManager.connect();
    NetworkManager.setUIManager(this);
  }

  onConnectClick() {
    NetworkManager.connect();
  }

  onCreateRoomClick() {
    NetworkManager.createRoom();
  }

  onJoinRoomClick() {
    const roomId = this.roomInput.string;
    NetworkManager.joinRoom(roomId);
  }
  updateRoomId(roomId: string) {
    this.roomIdLabel.string = "Room ID :" + roomId;
  }
}
