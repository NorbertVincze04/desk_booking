import { spawn, ChildProcess } from "child_process";
import net from "net";
import treeKill from "tree-kill";

const APP_NAME = "pgadmin-n8n";
const REMOTE_HOST =
  "d36f1f4-psql-master-alias.node.dc1.cdts.ipz001.internal.bosch.cloud";
const REMOTE_PORT = 5432;
const LOCAL_PORT = Number(process.env.PGPORT || 15432);

export class Tunnel {
  private proc: ChildProcess | null = null;

  async open(): Promise<void> {
    if (this.proc) return;
    this.proc = spawn(
      "cf",
      [
        "ssh",
        APP_NAME,
        "-L",
        `${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}`,
        "-N",
      ],
      { stdio: "ignore", shell: true }, // shell:true needed on Windows to resolve cf.cmd
    );
    this.proc.on("exit", () => {
      this.proc = null;
    });
    await this.waitUntilListening(15000);
  }

  private waitUntilListening(timeoutMs: number): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const tryConnect = () => {
        const socket = net.connect(LOCAL_PORT, "127.0.0.1");
        socket.once("connect", () => {
          socket.destroy();
          resolve();
        });
        socket.once("error", () => {
          socket.destroy();
          if (Date.now() - start > timeoutMs)
            reject(new Error("Tunnel did not become ready in time"));
          else setTimeout(tryConnect, 300);
        });
      };
      tryConnect();
    });
  }

  async close(): Promise<void> {
    if (!this.proc?.pid) return;
    const pid = this.proc.pid;
    this.proc = null;
    await new Promise<void>((resolve) =>
      treeKill(pid, "SIGTERM", () => resolve()),
    );
  }
}
