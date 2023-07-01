import * as vscode from "vscode"

import { SerialPort } from 'serialport'
import { encode } from "iconv-lite";
import { execSync } from "child_process";


export default async function debugRunEmu() {
    if (process.platform == "win32") {
        let editor = vscode.window.activeTextEditor; // エディタ取得


        if (editor) {
            const uri: vscode.Uri = editor.document.uri; //document url

            const lined_uri: vscode.Uri = uri.with({ path: uri.path + "_lined" })
            await vscode.workspace.fs.copy(uri, lined_uri, { overwrite: true })

            const content: string = (await vscode.workspace.fs.readFile(lined_uri)).toString();

            console.log(content)
            const text: string[] = content.split('\n');

            let lineNum_count: number = vscode.workspace.getConfiguration('devtools-for-pc-g850vs').get("setting_lineNum_count", 10);
            const lineNum_diff: number = vscode.workspace.getConfiguration('devtools-for-pc-g850vs').get("setting_lineNum_diff", 10);

            const convertedText: String[] = []

            text.forEach((e: string) => {
                convertedText.push(lineNum_count + e);
                lineNum_count += lineNum_diff;
            })

            console.log(convertedText.join("\r\n"))

            const outputBuf: Uint8Array = Uint8Array.from(Buffer.from(convertedText.join('\n')));
            await vscode.workspace.fs.writeFile(lined_uri, outputBuf);


            if (process.platform == 'win32') {
                // 2重3項演算子（使えるか不明）
                const terminal: vscode.Terminal = vscode.window.activeTerminal !== undefined ? vscode.window.activeTerminal.name == "DevTools for PC-G850VS" ? vscode.window.activeTerminal : vscode.window.createTerminal("DevTools for PC-G850VS") : vscode.window.createTerminal("DevTools for PC-G850VS");

                terminal.show()
                terminal.sendText(`cd ${vscode.workspace.getConfiguration('devtools-for-pc-g850vs').get("setting_emulatorPath", "~/g800win32")}`)
                terminal.sendText(`.\\g800.exe -sio_in="${lined_uri.fsPath}"`)
            }
        }
    }
    else {
        // デバッグしてないけど多分動く
        vscode.window.showErrorMessage(
            "このコマンドはWindows環境以外で実行できません。",
            { modal: true },
        )
    }
}
