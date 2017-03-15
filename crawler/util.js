const fs = require( 'fs' )
const Entities = require( 'html-entities' ).AllHtmlEntities
const entities = new Entities()

const error = ( e ) => console.log( 'err', e )

const getIndex = ( s, song ) => 
  entities.decode( s.tit_art ) == entities.decode( song.tit_art )

const getFind = ( el ) => !el.includes( '/' ) && !el.includes( '\\' )

const toNewFuckingPromise = ( promise, index ) => 
  promise.catch( () => { throw index } )

// Promise.enhancedRace = ( promises ) => {
//   if ( !promises.length ) {
//     return Promise.reject( 'não há buscadores' )
//   }
//   // There is no way to know which promise is rejected.
//   // So we map it to a new promise to return the index when it fails
//   let indexPromises = promises.map( toNewFuckingPromise )

//   return Promise.race( indexPromises )
//                 .catch( index => continuesWithTheRace( promises ) )
// }

const rejectWhenDontExistsProviders = () => 
  Promise.reject( 'não há buscadores' )


const raceThisShit = ( promises, toNewFuckingPromise, continuesWithTheRace ) => {
  // There is no way to know which promise is rejected.
  // So we map it to a new promise to return the index when it fails
  let indexPromises = promises.map( toNewFuckingPromise )

  return Promise.race( indexPromises )
                .catch( index => continuesWithTheRace( promises ) )
}

const continuesWithTheRace = ( promises ) => ( index ) => {
  // The promise has rejected, 
  // remove it from the list of promises and just continue the race.
  let p = promises.splice( index, 1 )[ 0 ]
  
  p.catch( error )

  return Promise.enhancedRace( promises )
}

Promise.enhancedRace = ( promises ) =>
  ( promises.length )
    ? raceThisShit( promises, toNewFuckingPromise, continuesWithTheRace )
    : rejectWhenDontExistsProviders()



const findBestArtistMatch = ( str, anotherString ) => {
  //TODO: improve validation
  if ( anotherString.length > anotherString.length ) {
    let match = new RegExp( str, 'i' ).test( find.replace( '+', ' ' ) )

    if (!match) {
        return anotherString
    }
  }

  return str
}


const decodeHTMLEntities = ( str ) => {

  if( str && typeof str === 'string' ) {
    str = str.replace( /<script[^>]*>([\S\s]*?)<\/script>/gmi, '' )
    str = str.replace( /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '' )
    str = str.replace( /&#x[A-Z][0-9]/gmi, '' )
  }
  return str
}

const ensureExists = ( path, mask, cb ) => {
  if ( typeof mask === 'function' ) {
    cb = mask
    mask = 0777
  }
  fs.mkdir( path.replace('"', '').replace('"', ''), mask, (err) =>
    ( err ) 
      ? ( err.code == 'EEXIST' ) ? cb( null ) : cb( err )
      : cb( null )
  )
}

const removeDupes = (song, i, self) => 
  ( self.length > 1 ) 
    ? self.findIndex( s => getIndex( s, song ) ) === i 
    : true

module.exports = {
  getFind,
  findBestArtistMatch,
  decodeHTMLEntities,
  ensureExists,
  removeDupes
} 

