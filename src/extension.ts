// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import writeSIO from './writesio';
import readSIO from './readsio';
import debugRunEmu from './debugRunEmu';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "devtools-for-pc-g850vs" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let cmd_writeSIO = vscode.commands.registerCommand('devtools-for-pc-g850vs.writeSIO', () => {
		writeSIO();
	});

	let cmd_readSIO = vscode.commands.registerCommand('devtools-for-pc-g850vs.readSIO', () => {
		readSIO();
	});

	let cmd_debugRunEmu = vscode.commands.registerCommand('devtools-for-pc-g850vs.debugRunEmu', () => {
		debugRunEmu();
	});


	context.subscriptions.push(cmd_writeSIO, cmd_readSIO, cmd_debugRunEmu);
}

// This method is called when your extension is deactivated
export function deactivate() {}
