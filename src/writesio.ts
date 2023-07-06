import * as vscode from "vscode"

import { SerialPort } from 'serialport'
import { encode } from "iconv-lite";



export default function writeSIO() {
    const sp: Thenable<vscode.QuickPickItem[]> = new Promise(resolve => {
        let serialport_list: vscode.QuickPickItem[] = [];

        SerialPort.list().then(ports => {
            ports.forEach((port) => {
                const item: vscode.QuickPickItem = { label: port.path, description: port.pnpId };
                serialport_list.push(item)
            });
        }).then(() => {
            console.log(serialport_list)

            resolve(serialport_list);
        })

    });

    sp.then((list) => {
        const options: vscode.QuickPickOptions = { title: "データを受信するシリアルポートを選択してください。" }

        vscode.window.showQuickPick(list, options).then((selectedCommand) => {
            if (selectedCommand) {
                console.log()

                const serialport = new SerialPort({
                    path: selectedCommand.label,
                    baudRate: 9600,
                    dataBits: 8,
                    parity: 'none',
                    stopBits: 1,
                }, (err) => {
                    if (err === null) {
                        // シリアルポート開いた
                        let editor = vscode.window.activeTextEditor; // エディタ取得

                        if (editor) {
                            let doc = editor.document;            // ドキュメント取得

                            // 選択範囲が空であれば全てを選択範囲にする
                            const startPos = new vscode.Position(0, 0);
                            const endPos = new vscode.Position(doc.lineCount - 1, 10000);
                            const cur_selection = new vscode.Selection(startPos, endPos);

                            const text: string[] = doc.getText(cur_selection).split('\r\n'); //取得されたテキスト

                            let lineNum_count: number = vscode.workspace.getConfiguration('devtools-for-pc-g850vs').get("setting_lineNum_count", 10);
                            const lineNum_diff: number = vscode.workspace.getConfiguration('devtools-for-pc-g850vs').get("setting_lineNum_diff", 10);

                            let convertedText: String[] = []

                            text.forEach((e: string, i: number) => {
                                convertedText.push(lineNum_count + e);
                                lineNum_count += lineNum_diff;
                            })

                            console.log(convertedText.join("\r\n"))

                            serialport.write(encode(convertedText.join("\r\n"), "SJIS"), 'binary', (error) => {
                                if (error === null || error === undefined) {
                                    // 書き込み成功
                                    serialport.write("\x1a", (error) => {
                                        vscode.window.showInformationMessage(`データを${selectedCommand.label}ポートに書き込みました。`)
                                        serialport.flush()
                                        serialport.close()
                                    })
                                }
                                else {
                                    // 書き込み失敗
                                    vscode.window.showErrorMessage(`${selectedCommand.label}ポートにデータを書き込めませんでした。`)
                                    serialport.flush()
                                    serialport.close()
                                }
                            })
                        }
                        else {
                            // VScodeでドキュメントが取得できない
                            vscode.window.showErrorMessage(`ファイルが開かれていません。`)
                        }
                    }
                    else {
                        // シリアルポート開けない
                        vscode.window.showErrorMessage(`${selectedCommand.label}ポートを開けませんでした。`)
                    }
                })



            }
        })
    })
}
