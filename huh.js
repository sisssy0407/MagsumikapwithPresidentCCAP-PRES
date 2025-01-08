

// Sidenav open/close functionality
function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}
  
function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}
  
// Handle single-selection checkboxes
function handleCheckboxes(name) {
	const checkboxes = document.getElementsByName(name);
	checkboxes.forEach((checkbox) => {
		checkbox.addEventListener("change", function () {
			checkboxes.forEach((c) => {
				if (c !== this) c.checked = false;
			});
		});
	});
}

// Initialize checkboxes for "Donate"
handleCheckboxes("Donate");
  
// User Data Management
function loadUserData() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (user) {
		document.getElementById("user-avatar").src = user.avatar;
		document.getElementById("user-name").textContent = user.name;
		document.getElementById("points-display").textContent = user.points || 0;
	} else {
		window.location.href = "index.html";
	}
}
  
function saveUserData(user) {
	localStorage.setItem("user", JSON.stringify(user));
}
  
loadUserData(); // Load user data on page load
  
// Pop-up Notification
function showPopup(message) {
	const popup = document.createElement("div");
	popup.id = "popup-notification";
	popup.innerHTML = `
		<h3>Submission Successful!</h3>
		<p>${message}</p>
		<button id="close-popup-btn">Close</button>
	`;
	document.body.appendChild(popup);

	document.getElementById("close-popup-btn").addEventListener("click", () => {
		document.body.removeChild(popup);
	});
}

// Task Submission Logic
document.getElementById("submit-proof-form-btn").addEventListener("click", () => {
	const selectedTask = document.querySelector('input[name="Donate"]:checked');
	const teacherEmail = document.getElementById("teacher-select").value;
	const proofDescription = document.getElementById("proof-description").value;
	const proofFile = document.getElementById("proof-file").files[0];

	if (!selectedTask || !teacherEmail || !proofDescription || !proofFile) {
		alert("Please complete all fields!");
		return;
	}

	// Update points
	const user = JSON.parse(localStorage.getItem("user"));
	const taskPoints = parseInt(selectedTask.getAttribute("data-points"), 10);
	user.points = (user.points || 0) + taskPoints;
	saveUserData(user);
	document.getElementById("points-display").textContent = user.points;

	// Save Notification
	const reader = new FileReader();
	reader.onload = function (event) {
		const proofImageData = event.target.result;
		const notification = {
			email: teacherEmail,
			message: "New proof submitted by a student.",
			description: proofDescription,
			image: proofImageData, // Store the base64 image data
		};

		const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
		notifications.push(notification);
		localStorage.setItem("notifications", JSON.stringify(notifications));

		// Display success message
		showPopup(`Your proof has been sent to ${teacherEmail}. Points: ${taskPoints}`);

		// Clear form fields
		document.getElementById("proof-file").value = "";
		document.getElementById("proof-description").value = "";
		document.getElementById("teacher-select").selectedIndex = 0;
		document.querySelectorAll('input[name="Donate"]').forEach((checkbox) => (checkbox.checked = false));
	};
	reader.readAsDataURL(proofFile); // Read the proof file as a base64 string
});

// Scroll to Sections
document.getElementById("view-transactions-btn").addEventListener("click", () => {
	const transactionsSection = document.getElementById("transactions");
	transactionsSection.style.display = transactionsSection.style.display === "block" ? "none" : "block";
	transactionsSection.scrollIntoView({ behavior: "smooth" });
});
  
document.getElementById("submit-proof-btn").addEventListener("click", () => {
	const proofSubmissionSection = document.getElementById("proof-submission");
	proofSubmissionSection.scrollIntoView({ behavior: "smooth" });
});
  
// Reward Redemption
function redirectToScanner() {
	const rewardSelect = document.getElementById("reward-select");
	const selectedRewardPoints = parseInt(rewardSelect.options[rewardSelect.selectedIndex].getAttribute("data-points"), 10);
	const user = JSON.parse(localStorage.getItem("user"));

	if (!user || user.points < selectedRewardPoints) {
		alert("Not enough points to redeem this reward.");
		return;
	}

	user.points -= selectedRewardPoints;
	saveUserData(user);
	document.getElementById("points-display").textContent = user.points;
	window.location.href = "redeem.html";
}

document.getElementById('submit-proof-form-btn').addEventListener('click', function () {
	// Get selected tasks
	const checkboxes = document.querySelectorAll('#task input[type="checkbox"]:checked');
	const selectedTasks = Array.from(checkboxes).map(checkbox => checkbox.nextElementSibling.textContent);

	// Get the proof file
	const proofFileInput = document.getElementById('proof-file');
	const proofFile = proofFileInput.files[0];

	// Get current date
	const currentDate = new Date().toLocaleString();

	// Reference to transactions list
	const transactionsList = document.getElementById('transactions-list');

	// Append each selected task with the date and proof file
	selectedTasks.forEach(task => {
		const listItem = document.createElement('li');
		listItem.textContent = `${currentDate} - ${task}`;

		// Check if a file was uploaded
		if (proofFile) {
			const fileLink = document.createElement('a');
			const proofFileURL = URL.createObjectURL(proofFile); // Create URL for the proof image
			fileLink.href = proofFileURL; // Link to proof file
			fileLink.textContent = 'View Proof';
			fileLink.target = '_blank';
			listItem.appendChild(fileLink);
		}

		transactionsList.appendChild(listItem);
	});

	// Show the transactions section
	document.getElementById('transactions').style.display = 'block';

	// Store the proof submission data in localStorage for teacher view
	const proofData = {
		date: currentDate,
		tasks: selectedTasks,
		proofFile: proofFile ? proofFile.name : null,
		proofFileURL: proofFile ? URL.createObjectURL(proofFile) : null, // Store the proof file URL
	};

	localStorage.setItem('submittedProof', JSON.stringify(proofData));

	// Clear checkboxes and file input after submission
	checkboxes.forEach(checkbox => {
		checkbox.checked = false;
	});
	proofFileInput.value = '';  // Clear the file input
});
