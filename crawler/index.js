#!/usr/bin/env node
const os = require(`os`)
const fs = require(`fs`)

const utils = require('./util')

const inquirer = require('inquirer')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const PATH = './musics/'
const SliderKZ = require('./providers/sliderkz')
const MusicPleer = require('./providers/musicpleer')
const YoutubeInMp3 = require('./providers/youtubeinmp3')

const music = process.argv.filter( utils.getFind ).join('+')

const events = require('events')
const eventEmitter = new events.EventEmitter()

console.time( 'tempo para receber a resposta' )
console.log(`\n\n\n\t\t INICIANDO A BUSCA PARA: ${music} ` )

const errorDontChoseMusic = () => 
  console.log( "não foi escolhido/encontrado nenhuma música" )

const errorDirectory = ( err ) => 
  console.log('Nao rolou criar as pastas aqui', err)

const getSongs = ( song ) => 
  answers.songs.includes( entities.decode( song.tit_art ) )

const download = ( body, title, el, ARTISTPATH ) => 
  body.download(  title, 
                  entities.decode( el.url ), 
                  ARTISTPATH + '/' +
                  utils.decodeHTMLEntities( `${title}.mp3` ) )

const choose = ( songs, cb ) => {

  const artists = []

  const question1 = {
    type: 'checkbox',
    message: 'Selecione as canções',
    name: 'songs',
    choices: [
      new inquirer.Separator(' = As sonzeiras = ')
    ],
    validate: (answer) => !! answer.length
  }

  songs.map( ( song, key ) => {
      if ( !artists.includes( song.artist ) && song.artist != '' ) 
        artists.push( song.artist )
      
      question1.choices.push( { name: entities.decode(song.tit_art) })
  })

  const artist = ( artists.length > 1 ) 
                    ? artists.reduce( utils.findBestArtistMatch ) 
                    : artists[0]

  const objAnswers = {
    artist,
    songs: songs.filter( getSongs ).filter( utils.removeDupes )
  }

  inquirer.prompt( [ question1 ] )
          .then( ( answers ) => cb( null, objAnswers ) )

}

Promise.enhancedRace( [
  MusicPleer.search( music ),
  SliderKZ.search( music ),
  YoutubeInMp3.search( music )
] ).then( ( body ) => {

  choose( body.songs, ( err, response ) => {

    ( !response.songs )
      ? errorDontChoseMusic()
      : response.songs.map( ( el ) => {
          const title = entities.decode( el.tit_art )
          const ARTISTPATH = PATH + entities.decode( response.artist )
                                            .replace('/', '_')
          const cb = ( err ) =>
            err 
              ? errorDirectory( err )
              : download( body )

          Promise.
            all( [
            {
              then: ( resolve, reject ) => 
                utils.ensureExists(PATH, 0744, ( err ) => resolve( 0 ) )
            }, 
            {
              then: ( resolve, reject ) => 
              utils.ensureExists(ARTISTPATH, 0744, ( err ) => resolve( err ) )
            } ] )
            //artist folder
            .then( err =>  // WTF IS THT???
              ( err.reduce( ( f, s ) => f || s ) ) 
                ? Promise.reject( err ) 
                : cb( null ) )
            .catch( err => cb( err ) )
          
        })
      
      return response.songs
  } )
}, ( err ) => console.log( err ) )


