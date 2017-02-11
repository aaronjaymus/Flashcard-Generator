var inquirer = require('inquirer');
var fs = require('fs');

function start (){
	inquirer.prompt([
			{
				name: 'toDo',
				message: 'What would you like to do?',
				choices: ['Create flashcards','Test myself', 'Quit'],
				type: 'list'
			}
		]).then(function(answer){
			switch(answer.toDo){
				case 'Create flashcards':
					createType();
					break;
				case 'Test myself':
					testType();
					break;
				case 'Quit':
					console.log("Come back again when you're ready.");
					break;
				default: 
					console.log("Something went wrong.");
					break;			
			}
		});
};

function createType (){
	inquirer.prompt([
			{
				name: 'cardType',
				message: 'Which type of card would you like to create?',
				choices: ['Basic card', 'Cloze card'],
				type: 'list'
			}
		]).then(function(answer){
			if(answer.cardType === 'Basic card'){
				createBasic();
			} else {
				createClozeSentence();
			}
		});	
};

function createBasic (){
	inquirer.prompt([
			{
				name: 'front',
				message: 'Front of card',
				type: 'input'
			},{
				name: 'back',
				message: 'Back of card',
				type: 'input'
			}
		]).then(function(answers){
			basicCardCreate(answers.front, answers.back);
		});
};

function createClozeSentence (){
	inquirer.prompt([
			{
				name: 'full',
				message: 'What is the full sentence?',
				type: 'input'
			}
		]).then(function(answer){
			createClozeAnswer(answer.full);
		});
};

function createClozeAnswer (sentence){
	var full = sentence;
	inquirer.prompt([
			{
				name: 'answer',
				message: 'Cloze text',
				type: 'input'
			}
		]).then(function(answer){
			var index = full.indexOf(answer.answer.trim());
			if(index === -1){
				console.log("This text is not part of original sentence. Try again.");
				createClozeAnswer(sentence);
			} else {
				clozeCardCreate(sentence, answer.answer);
			}
		});
}

function basicCardCreate(front, back){
	//console.log(front, back);
	var basicCard = new Basic(front, back);

	fs.appendFile('basicCard.txt', JSON.stringify(basicCard), function(err, data){
		if(err){
			console.log(err);
		}
	});

	inquirer.prompt([
			{
				name: 'makeAnother',
				message: 'Make another basic card?',
				type: 'confirm'
			}
		]).then(function(answer){
			if(answer.makeAnother){
				createBasic();
			} else {
				start();
			}
		});
};

function clozeCardCreate(full, answer){
	//console.log(full, answer);
	var clozeCard = new Cloze(full, answer);

	fs.appendFile('clozeCard.txt', JSON.stringify(clozeCard), function(err, data){
		if(err){
			console.log(err);
		}
	});

	inquirer.prompt([
		{
			name: 'makeAnother',
			message: 'Make another cloze card?',
			type: 'confirm'
		}
	]).then(function(answer){
		if(answer.makeAnother){
			createClozeSentence();
		} else {
			start();
		}
	});
};

function Basic (front, back){
	this.front = front;
	this.back = back;
};

function Cloze(full, answer){
	this.full = full;
	this.answer = answer;
};

Cloze.prototype.clozeSentence = function(){
	var cloze = this.full.replace(this.answer, "...");
	return cloze;
};

function testType () {
	inquirer.prompt([
			{
				name: 'testType',
				message: 'Would you like to go through basic or cloze flashcards?',
				choices: ['Cloze', 'Basic'],
				type: 'list'
			}
		]).then(function(answer){
			if(answer.testType === 'Basic'){
				basicTest();
			} else {
				clozeTest();
			}
		});
};

function basicTest (){
	fs.readFile('basicCard.txt', 'utf8', function(err, data){
		if(err){
			console.log(err);
		} else {
			basicRun(data);
		}
	})
};

function basicRun (data){
	var questions = JSON.parse(data);
	
	console.log(questions);
};
start();

