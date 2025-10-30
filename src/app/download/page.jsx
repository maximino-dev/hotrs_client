"use client"

import {useEffect, useState } from 'react';
import { useEventListener } from 'usehooks-ts'
import './App.css';

var ENTER_KEY = 13;
var currentAudio;
var timeout;

var APINODE = "https://hotrs.fr/yt/"

const SearchBar = ({query, setQuery, handleKeyPressFunc}) => {

	return (
		<div className="searchBar">
		<img className="searchIcon" src='./search.svg' />
		<input
			type="text"
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			style={{
				width: "100%",
				border: 'none',
				zIndex: "1",
				backgroundColor: "white",
			}}
		/>
		</div>
	);
}

function pendingMusic(index) {
	const el = document.getElementById(index);
	const button = el.querySelector('.downloadButton');
	const downloadIcon = button.querySelector('.downloadIcon');
	return downloadIcon.style.visibility == "hidden";
}

function ListSongs({ songs }) {

	function fetchDownloadAndPlay(title, artist, index) {
		if (title != "" && artist != "") {
			const el = document.getElementById(index);
			const button = el.querySelector('.downloadButton');
			const downloadIcon = button.querySelector('.downloadIcon');
			const loader = button.querySelector('.loader');
			el.style.background = "#6fa6ec";
			el.style.opacity = "50%";

			downloadIcon.style.visibility = "hidden";
			loader.style.visibility = "visible";
			fetch(APINODE + "download?title=" + title.replace(/&/g, "") + "&artist=" + artist)
			.then(
				response => {
								downloadIcon.style.visibility = "visible";
								loader.style.visibility = "hidden";
								el.style.background = '';
								el.style.opacity = "100%"; }
			);
		}
	}

	const requestOptions = {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	};

	function fetchDownloadAndDownload(title, artist, index) {
		if (pendingMusic(index)) {
			return;
		}
		const id = (title + artist).replace(/[^a-zA-Z0-9]/g, "");
		fetch(APINODE + "songs/" + id + ".mp3", requestOptions).then(response => { 
			if (response.status == 200) return response.blob(); 
			else {fetchDownloadAndPlay(title, artist, index); throw new Error('Song not found'); } })
		.then((blob) => {
			if (blob != undefined) {
				const href = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = href;
				link.setAttribute('download', title + ".mp3");
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}).catch( (error) => { console.log(error); });
	}

	function playSong(title, artist, index) {
		if (pendingMusic(index)) {
			return;
		}
		const id = (title + artist).replace(/[^a-zA-Z0-9]/g, "");
		try {
			fetch(APINODE + "songs/" + id + ".mp3").then(
				response => { if (response.status == 404) { fetchDownloadAndPlay(title, artist, index); throw new Error('Song not found'); } }
			).then(
				() => {
						if (typeof currentAudio === 'undefined') {
							currentAudio = new Audio(APINODE + "songs/" + title + "_" + artist + ".mp3");
						} else if (!currentAudio.paused) {
							currentAudio.pause();
							clearTimeout(timeout);
						}
						
						currentAudio.src = APINODE + "songs/" + id + ".mp3";

						currentAudio.play();
						currentAudio.currentTime = 60;
						timeout = setTimeout(() => { currentAudio.pause(); }, 10000);
				}).catch( (error) => { console.log(error); });
		}
		catch (e) {
			console.log(e);
		}
	}

	if ("message" in songs) {
		return (
			<p> Erreur lors de la recuperation des titres... </p>
		);
	}
	const listSongs = songs.map( (song, index) =>
		<li id={index} onClick={(e) => { if (e.target == e.currentTarget) { playSong(song[0], song[1], index); } } }>
			<div className="trackContent">
				<p>{song[0]}</p>
				<p>{song[1]}</p>
				<img id="track" src={song[2]} />
			</div>
			<button onClick={() => { fetchDownloadAndDownload(song[0], song[1], index) } } className="downloadButton"><img className="downloadIcon" src='./download.svg' />
			<div class="loader"></div>
			</button>
		</li>);
	return (
		<div id="innerBox"><ul>{listSongs}</ul></div>
	);
}

function App() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	const handleKeyDown = (e) => {
		if (e.keyCode === ENTER_KEY) {
			fetchSearch(query);
		}
  	};

  	useEventListener("keydown", handleKeyDown);

	function fetchSearch(searchText) {
		setResults([]);
		if (searchText != "") {
			fetch(APINODE + "getTracks?search_query=" + searchText).then(
				response => response.json()
			).then(
				data => setResults(data)
			)
		}
	}

	return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					flexDirection: "column",
					background: "linear-gradient(to bottom, #3366ff 0%, #66ccff 100%)",
			}}>
			<h1>Maximusic</h1>
			<SearchBar query={query} setQuery={setQuery} />
			<ListSongs songs={results} />
			</div>
	);
}

export default App;
