import * as vscode from "vscode"

import { ReadlineParser, DelimiterParser, SerialPort } from 'serialport'
import { decode, decodeStream, encode, encodeStream } from "iconv-lite";



export default async function readSIO() {
    vscode.window.showSaveDialog({
        title: "受信データの保存先を指定",
        filters: {
            "テキストファイル": ["txt"],
            "BASIC ファイル": ["bas"],
            "C ファイル": ["c"],
            "アセンブリ ファイル": ["asm"],
        },
    }).then((res) => {
        if (res) {
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
                const options: vscode.QuickPickOptions = { title: "データを受信するシリアルポートを選択してください。" };

                vscode.window.showQuickPick(list, options).then((selectedCommand) => {
                    if (selectedCommand) {
                        const serialport = new SerialPort({
                            path: selectedCommand.label,
                            baudRate: 9600,
                            dataBits: 8,
                            parity: 'none',
                            stopBits: 1,
                        }, (err) => {
                            if (err === null) {
                                vscode.window.showInformationMessage(`${selectedCommand.label}からデータを受信する準備が整いました。\nデータを送信してください。`)

                                const parser = serialport.pipe(new DelimiterParser({ delimiter: '\x1a' }))

                                parser.on('data', (data) => {
                                    console.log(data)
                                    /*
                                    vscode.workspace.fs.writeFile(res, encode(data, "SJIS")).then(() => {
                                        vscode.window.showInformationMessage(`${selectedCommand.label}から${encode(data, "SJIS").byteLength}`)
                                        vscode.window.showTextDocument(res)
                                    })
                                    */

                                    serialport.flush()
                                    serialport.close()
                                })
                            }
                            else {
                                vscode.window.showErrorMessage(`${selectedCommand.label}ポートが開けませんでした。`)
                            }
                        })

                    }
                })
            })
        }
    })
}
