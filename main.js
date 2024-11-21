import { characters } from "./src/characters.js"
import { dialogs } from "./src/dialogs.js"

const TextBox = document.querySelector("#textbox")
const playerDiv = document.querySelector("#character_left")
const pnjDiv = document.querySelector("#character_right")

let current_dialog = get_dialog(1) // Initialisation avec le premier dialogue
let is_changing_card = false // Pour éviter les appels multiples à get_next_card()

// Fonction pour récupérer un dialogue par ID
function get_dialog(id) {
	return dialogs.find((x) => x.id === id) || null // Retourne null si non trouvé
}

// Fonction pour passer au prochain dialogue
function get_next_card() {
	if (is_changing_card) {
		console.warn("Transition en cours, ignorer cet appel.")
		return
	}
	is_changing_card = true

	let previous_dialog = current_dialog

	const next_card_id = current_dialog.next_card()
	console.log("Next card ID:", next_card_id)

	if (!next_card_id) {
		console.error("Prochain ID de carte non défini ou null.")
		is_changing_card = false
		return
	}

	current_dialog = get_dialog(next_card_id)
	if (!current_dialog) {
		console.error("Dialogue introuvable pour l'ID:", next_card_id)
		is_changing_card = false
		return
	}

	open_dialog(current_dialog)

	if (previous_dialog.pnj_id !== current_dialog.pnj_id) {
		// Animation changement de PNJ
		console.log("Animation PNJ.")
	}

	// Transition terminée
	is_changing_card = false
}

// Fonction pour écrire progressivement un texte
function write_text(text, container) {
	let splitted_text = text.split("")
	container.innerText = ""

	splitted_text.forEach((char, index) => {
		setTimeout(() => {
			if (text[index - 1] == " ") {
				container.innerText += " " + char
			} else {
				container.innerText += char
			}
		}, index * 50)
	})
}

// Fonction pour afficher un dialogue
function open_dialog(dialog) {
	playerDiv.innerHTML = ""
	pnjDiv.innerHTML = ""
	TextBox.innerHTML = ""

	// Gestion de l'image du joueur
	let player_img = document.createElement("img")
	if (
		characters[dialog.player_name] &&
		characters[dialog.player_name].emotions[dialog.player_img]
	) {
		player_img.setAttribute(
			"src",
			characters[dialog.player_name].emotions[dialog.player_img]
		)
		playerDiv.appendChild(player_img)
	} else {
		console.error(
			"Image du joueur introuvable:",
			dialog.player_name,
			dialog.player_img
		)
	}

	// Gestion du texte/question
	let text_p = document.createElement("p")
	TextBox.appendChild(text_p)
	write_text(dialog.question, text_p)

	// Gestion des réponses ou transition simple
	if (dialog.answers && dialog.answers.length > 0) {
		let questions_box = document.createElement("div")
		questions_box.setAttribute("id", "answers")
		TextBox.appendChild(questions_box)
		dialog.answers.forEach((element) => {
			let answer = document.createElement("a")
			answer.setAttribute("class", "answer")
			answer.innerText = element.text
			questions_box.appendChild(answer)

			// Gestion du clic sur une réponse
			answer.onclick = (event) => {
				event.stopPropagation() // Empêche le clic de se propager
				dialog.answered = element.id
				get_next_card()
			}
		})
	} else {
		// Si pas de réponses, clic sur la TextBox pour avancer
		TextBox.addEventListener("click", get_next_card, { once: true })

		let arrow_next = document.createElement("img")
		arrow_next.setAttribute("src", "./icons/chevron-right.svg")
		arrow_next.setAttribute("id", "arrow_next")
		TextBox.appendChild(arrow_next)
	}
}

// Initialisation du premier dialogue
open_dialog(current_dialog)
