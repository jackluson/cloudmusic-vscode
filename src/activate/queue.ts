import { PersonalFm, lock } from "../state";
import { QueueItemTreeItem, QueueProvider } from "../provider";
import { commands, window } from "vscode";
import { load, stop } from "../util";

export async function initQueue(): Promise<void> {
  const queueProvider = QueueProvider.getInstance();
  window.registerTreeDataProvider("queue", queueProvider);

  commands.registerCommand("cloudmusic.clearQueue", () => {
    QueueProvider.refresh(async () => {
      if (!PersonalFm.get()) {
        stop();
      }
      QueueProvider.clear();
    });
  });

  commands.registerCommand("cloudmusic.randomQueue", () => {
    QueueProvider.refresh(async () => {
      QueueProvider.random();
    });
  });

  commands.registerCommand(
    "cloudmusic.playSong",
    async (element: QueueItemTreeItem) => {
      if (!lock.playerLoad.get()) {
        PersonalFm.set(false);
        await load(element);
        QueueProvider.refresh(async () => {
          QueueProvider.top(element.item.id);
        });
      }
    }
  );

  commands.registerCommand(
    "cloudmusic.deleteSong",
    (element: QueueItemTreeItem) => {
      QueueProvider.refresh(async () => {
        QueueProvider.delete(element.item.id);
      });
    }
  );

  commands.registerCommand(
    "cloudmusic.playNext",
    (element: QueueItemTreeItem) => {
      if (QueueProvider.songs.length > 2) {
        const { id } = element.item;
        QueueProvider.refresh(async () => {
          const index = QueueProvider.songs.findIndex(
            (value) => value.valueOf() === id
          );
          if (index >= 2) {
            QueueProvider.songs = [
              QueueProvider.songs[0],
              QueueProvider.songs[index],
            ].concat(
              QueueProvider.songs.slice(1, index),
              QueueProvider.songs.slice(index + 1)
            );
          }
        });
      }
    }
  );
}
