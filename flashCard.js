var inquirer = require('inquirer');
var fs = require('fs');
var jsonfile = require('jsonfile');
//Starts program, asks whether user wants to create cards, test themselves, or quit

var basicArray = [];
var clozeArray = [];

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
					testAmount();
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
//If user chooses to create cards, they need to choose basic or cloze
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
//Starts basic creation, getting info to create a basic card
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
//Creates cloze sentence(front of card)
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
//Creates cloze answer, checks to make sure the answer is part of the cloze sentence so it can be replaced
//If answer doesn't match sentence, it will ask again for an answer until it gets a match
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
//Takes in args for question and answer and appends the information in the form of a text object to basic file
function basicCardCreate(front, back){
	//console.log(front, back);
	var basicCard = new Basic(front, back);

	basicArray.push(basicCard);

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
				jsonfile.readFile('basicCard.json', function(err, data){
					if(err){
						console.log(err);
					}
					if(data.length>0){
						Array.prototype.push.apply(data, basicArray);
						jsonfile.writeFile('basicCard.json', data, function(err){
							if(err){
								console.log(err);
							}
							basicArray = [];
						});
					} else {
						jsonfile.writeFile('basicCard.json', basicArray, function(err){
							if(err){
								console.log(err);
							}
							basicArray = [];
						});
					}
				});
				start();
			}
		});
};
//takes in args of full question and answer part of sentence, then appends question in form of text object to cloze file 
function clozeCardCreate(full, answer){
	//console.log(full, answer);
	var clozeCard = new Cloze(full, answer);

	clozeArray.push(clozeCard);

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
			jsonfile.readFile('clozeCard.json', function(err, data){
				if(data.length>0){
					Array.prototype.push.apply(data, clozeArray);
					jsonfile.writeFile('clozeCard.json', data, function(err){
						if(err){
							console.log(err);
						}
						clozeArray = [];
					});
				} else {
					jsonfile.writeFile('clozeCard.json', clozeArray, function(err){
						if(err){
							console.log(err);
						}
						clozeArray = [];
					});
				}
			});
			start();
		}
	});
};
//basic card object
function Basic (front, back){
	this.front = front;
	this.back = back;
};
//cloze card object
function Cloze(full, answer){
	this.full = full;
	this.answer = answer;
	this.clozeSentence = function (){
		var clozeSent = full.replace(answer, "...");
		return clozeSent;
	};
};
//Cloze sentence, replaces answer with "..."
// Cloze.prototype.clozeSentence = function(){

// };
function testAmount() {
	inquirer.prompt([
			{
				name: 'testAmount',
				message: 'How many questions would you like to do?',
				type: 'input'
			}
		]).then(function(answer){
			var num = parseInt(answer.testAmount);
			if(Number.isInteger(num)){
				testType(num);
			} else {
				console.log('This is not an integer, try again');
				testAmount();
			}
		});
}
//Choose test type
function testType (count) {
	inquirer.prompt([
			{
				name: 'testType',
				message: 'Would you like to go through basic or cloze flashcards?',
				choices: ['Cloze', 'Basic'],
				type: 'list'
			},
		]).then(function(answer){
			if(answer.testType === 'Basic'){
				basicTest(count);
			} else {
				clozeTest(count);
			}
		});
};

function basicTest (count){	
	jsonfile.readFile('basicCard.json', function(err, data){
		if(count>data.length){
			count = data.length;
		}
		
		var correct = 0;
		var total = count;
		var testArray = data;
		var basic;

		function basicLoop(){
			if(count>0){			
				var num = Math.floor(Math.random()*testArray.length);
				basic = new Basic(testArray[num].front, testArray[num].back);
				inquirer.prompt([
						{
							name: 'response',
							message: basic.front,
							type: 'input'
						}
					]).then(function(answer){
						if(answer.response === basic.back){
							console.log("Correct answer!");
							console.log("====================================================");
							correct++;
						}else{
							console.log("Sorry, incorrect. The correct answer was "+basic.back);
							console.log("=====================================================");
						}
						testArray.splice(num, 1);
						count--;	
						basicLoop();
					});
			}else{
				calculateScore(correct, total);
			}
		}
		basicLoop();
	});
};

function clozeTest(count){
	jsonfile.readFile('clozeCard.json', function(err, data){
		if(count>data.length){
			count = data.length;
		}

		var correct = 0;
		var total = count;
		var testArray = data;
		var cloze;

		function clozeLoop(){
			if(count>0){
				var num = Math.floor(Math.random()*testArray.length);
				var cloze = new Cloze(testArray[num].full, testArray[num].answer);
				var message = cloze.clozeSentence;
				inquirer.prompt([
						{
							name: 'response',
							message: message,
							type: 'input'
						}
					]).then(function(answer){
						if(answer.response === cloze.answer){
							console.log("Correct!");
							console.log(cloze.full);
							console.log("====================================");
							correct++;
						}else{
							console.log("Sorry, incorrect.");
							console.log(cloze.full);
							console.log("====================================");
						}
						testArray.splice(num, 1);
						count--;
						clozeLoop();
					});
			}else{
				calculateScore(correct, total);
			}
		}
		clozeLoop();
	});
};

function calculateScore(correct, total){
	var score = correct / total;
	console.log("You scored a " + score.toFixed(2));
};

start();

