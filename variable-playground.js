var grades = [70, 90];

function updateGrades1 (arr) {
	arr = [10, 20, 30];
}

updateGrades1(grades);
console.log(grades);

function updateGrades2 (arr) {
	arr.push(80);
}

updateGrades2(grades);
console.log(grades);
