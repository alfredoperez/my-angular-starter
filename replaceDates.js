const fs = require('fs');
const path = require('path');

// Read the JSON file
const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8');

// Parse the JSON
const jsonData = JSON.parse(data);

// Iterate over the users array
jsonData.users.forEach((user) => {
  // Create a new Date object for the current date and time
  let currentDate = new Date();

  // Create a new Date object for "createdAt" and set it to one month ago
  let createdAt = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

  // Create a new Date object for "updatedAt" and set it to one week ago
  let updatedAt = new Date(currentDate.setDate(currentDate.getDate() - 7));

  // Generate a random number of days up to 30
  let randomDays = Math.floor(Math.random() * 30);

  // Subtract the random number of days from "createdAt"
  createdAt.setDate(createdAt.getDate() - randomDays);

  // Subtract the random number of days from "updatedAt"
  updatedAt.setDate(updatedAt.getDate() - randomDays);

  // Generate a random age between 25 and 45
  let age = Math.floor(Math.random() * 20) + 25;

  // Add the random age to the user
  user.age = age;

  // Replace the "createdAt" and "updatedAt" fields with new dates
  user.createdAt = createdAt.toISOString();
  user.updatedAt = updatedAt.toISOString();
});

// Convert the JSON back to a string
const newJsonData = JSON.stringify(jsonData, null, 2);

// Write the new JSON string back to the file
fs.writeFileSync(path.join(__dirname, 'db.json'), newJsonData, 'utf-8');
