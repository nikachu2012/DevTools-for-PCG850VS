import * as vscode from "vscode"

import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { decode, decodeStream } from "iconv-lite";



export default async function readSIO() {
    // InputBoxを呼び出す。awaitで完了を待つ。
    const result = await vscode.window.showInputBox({
        placeHolder: new Date().getTime().toString() + ".txt",
        title: "受信データのファイル名を入力してください。"
    });
    // ここで入力を処理する
    if (result) {
        // 入力が正常に行われている
        vscode.window.showInformationMessage(`Got: ${result}`);

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
                    console.log()

                    const serialport = new SerialPort({
                        path: selectedCommand.label,
                        baudRate: 9600,
                        dataBits: 8,
                        parity: 'none',
                        stopBits: 1,
                    }, (err) => {
                        if (err === null) {

                            vscode.window.showInformationMessage(`${selectedCommand.label}からデータを受け取る準備が整いました。\nデータを送信してください。`)

                            const parser = serialport.pipe(new ReadlineParser({ delimiter: '\x1a' })).pipe(decodeStream('SJIS'));

                            parser.on('data', (data) => {
                                console.log(data)
                            })

                            /*
                            const message = vscode.window.showInformationMessage(
                                `${selectedCommand.label}からデータを受け取る準備が整いました。\nデータを送信してください。`,
                                { modal: true },
                                { title: "保存", isCloseAffordance: false },
                                { title: "キャンセル", isCloseAffordance: true }
                            ).then((msg) => {
                                console.log(msg)
                                if (msg) {
                                    if (msg.title === "保存") {
                                        // data from Serial port
                                        
                                    }
                                    else if (msg.title === "キャンセル") {

                                    }
                                }
                            });

                            //*/


                        }
                        else {
                            vscode.window.showErrorMessage(`${selectedCommand.label}ポートが開けませんでした。`)
                        }
                    })

                }
            })
        })
    } else {
        // 入力がキャンセルされた
        vscode.window.showWarningMessage(`Failed to get`);
    }


}
