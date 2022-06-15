import Head from 'next/head';
import styles from '../styles/Home.module.css';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/Image'
import * as d3 from 'd3'


const clientID = "9295e33704954fa28da167392bb0e480";
const authEndpoint = "https://accounts.spotify.com/authorize";
const redirectURL = "http://192.168.1.247:3000/";



const tokenAfterRedirect = (hash) => {

  const afterHashing = hash.substring(1);
  const urlParamaters = afterHashing.split("&");
  return urlParamaters[0].split("=")[1];

}



export default function Home() {

  const [token, setToken] = useState("")
  const [data, setData] = useState({})
  const [artist, setArtist] = useState({})
  const [query, setQuery] = useState("")
  const [a, setA] = useState("")




  // useEffect(() => {
  //   if (query)
  //     getArtist(event)

  // }, [query])



  useEffect(() => {
    let token = "";
    if (window.location.hash) {
      token = tokenAfterRedirect(window.location.hash)
      console.log(token);

      localStorage.clear();
      localStorage.setItem("access_token", token);
    }

    setToken(token)
  }, [])

  useEffect(() => {
    var topTracks = data.tracks?.map((track) => {
      return ({ name: track.name, popularity: track.popularity })
    })

    if (topTracks) {

      for (let i = 0; i < 5; i++) {
        topTracks.pop()
      }

      console.log("These are the TT")
      console.log(topTracks)


      //svg container
      const width = 900
      const height = 500
      const container = d3.select('svg')
        .classed('barContainer', true)
        .style('overflow', 'visible')
        .style('margin-top', '50px')
        .style('border-color', 'transparent')
        .attr('width', width)
        .attr('height', height).attr('peserveAspectRatio', "xMinYMin meet" )
        .attr("viewBox", "0 0 900 500")

      container.selectAll('*').remove()

      //svg scaling
      const xScale = d3.scaleBand().rangeRound([0, width])
        .padding(0.1)
        .domain(topTracks.map((track) => track.name))

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(topTracks, d => d.popularity) + 10])
        .range([height, 0])

      //svg axis
      const xAxis = d3.axisBottom(xScale)
      const yAxis = d3.axisLeft(yScale).ticks(10)


      //svg data
      const chart = container.append('g')
      chart.selectAll('.bar').data(topTracks).enter().append('rect')
        .style('fill', '#1F2232')
        .style('stroke', '#8E9DCC')
        .attr('width', xScale.bandwidth())
        .attr('height', val => height - yScale(val.popularity))
        .attr('y', (val) => yScale(val.popularity))
        .attr('x', (val) => xScale(val.name))

      //Labels
      chart.append('g').call(d3.axisBottom(xScale)).attr('transform', `translate(0, ${height})`)
      chart.selectAll('.label')
        .data(topTracks)
        .enter()
        .append('text')
        .text((pop) => pop.popularity)
        .attr('x', data => xScale(data.name) + xScale.bandwidth() / 2)
        .attr('y', data => yScale(data.popularity) - 10)
        .attr('text-anchor', 'middle')
        .attr("font-weight", "bold")
        .attr("font-size", "17px")
        .classed('label', true)

      chart.selectAll('g').selectAll('text').attr("font-weight", "bold").attr("font-size", "10px")
    }
  }, [data])


  async function getArtist(e) {
    e?.preventDefault();
    axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: query,
        type: "artist",
        limit: 5
      }
    })
      .then((Response) => {
        setArtist(Response.data)
      })
      .catch((console.error()))

    console.log(artist)
  }


  async function getTracks(e) {
    e?.preventDefault();

    const id = a.id

    axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        market: "ES",
        limit: 5
      }
    })
      .then((Response) => {
        setData(Response.data)
      })
      .catch((console.error()))
  }

  useEffect((() => {
    getTracks(event)
  }), [a])

  function showResults() {

    return (artist.artists?.items.map((artist) => (


      <div key={artist.id} className={styles.results}>
        <ol>
          <li><button onClick={() => { setA(artist) }}>{artist.name}</button></li>
        </ol>
      </div>

    )))
  }



  function renderInfo() {
    if (a) {

      return (
        <div>
          <h1>{a.name}</h1>
          <img src={a.images[0]?.url} alt="" width={500} height={500} />

        </div>

      )
    }
  }




  return (
    <div>

      <Head>
        <title> Spotify Project </title>
      </Head>

      <div>
        <nav>
          <div className={styles.container}>
            <div className={styles.nav}>
              <Image src="/logo.png" width={225} height={70}  ></Image>
              {
                token ?

                  (<button className={styles.nav} onClick={() => {
                    localStorage.clear("access_token")
                    window.location = redirectURL
                  }}>Logout</button>)

                  :

                  <button className={styles.nav} onClick={() => {
                    window.location = `${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURL}&response_type=token&show_dialog=true`;
                  }}>Login to Spotify</button>

              }

            </div>
          </div>
        </nav>

        <header>
          <div className={styles.container}>
            <div className={styles.header}>
              {
                token ?
                  <div>
                    <h1>Type in an Artist to get the Top Tracks!</h1>

                    <form className={styles.form}>

                      <div className={styles.search}>
                        <input type="text" onChange={(e) => { setQuery(e.target.value) }} placeholder="name of artist"></input>
                        <button onClick={getArtist}> Search</button>
                      </div>
                      <div className={styles.sr}>
                        {showResults()}
                      </div>
                    </form>
                  </div>

                  :

                  <form className={styles.header}>
                    <h1>Log In To Search For Artists!</h1>
                  </form>
              }



            </div>
          </div>
        </header>

        <section>

          <div className={styles.container}>
            <div className={styles.Section}>
              <div className={styles.author}>
                {renderInfo()}
              </div>

              <div className={styles.barContainer}>
                <svg className={styles.SVG}></svg>
              </div>
            </div>
          </div>
        </section>


      </div>

    </div>
  )
}
