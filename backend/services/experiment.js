const api_key = 'e7bafd491af23dcc2cc134b14174e118';
const axios = require('axios');


function tokenize_docs(documents) {
    return documents.map(x => x.match(/\w+/g));
}


/**
 * Extract the vocabulary from a list of tokenized documents. Receive a
  * array of string arrays, returns an alphabetically ordered array with
  * the unique strings (normalized to lowercase) there are.
 */
function vocabulary(tokenized_docs) {
    var vocab = [];
    for (var i=0; i<tokenized_docs.length; ++i) {
        for (var k=0; k<tokenized_docs[i].length; ++k) {
            var word = tokenized_docs[i][k].toLowerCase();
            if (!vocab.includes(word)) vocab.push(word);
        }
    }
    return vocab.sort();
}


/**
 * Counts the tokens in a token list. Receive an array with strings,
  * returns an object where the keys are tokens and the values are their frequency.
 */
function counter(tokens) {
    var freqs = {};
    for (var i=0; i<tokens.length; ++i) {
        freqs[tokens[i]] = freqs[tokens[i]] ? freqs[tokens[i]] + 1 : 1;
    }
    return freqs;
}


/**
 * Create word frequency count vectors (normalized to lowercase)
  * from a list of tokenized documents and a list with words of
  * vocabulary. Receive an array of string arrays and an array of strings,
  * returns an array of integers array.
 */
function count_vectorize(tokenized_docs, vocabulary) {
    var vecs = [];
    for (var i=0; i<tokenized_docs.length; ++i) {
        var vec = [];
        var count = counter(tokenized_docs[i].map(x => x.toLowerCase()));
        for (var k=0; k<vocabulary.length; ++k) {
            if (count.hasOwnProperty(vocabulary[k])) {
                vec.push(count[vocabulary[k]])
            }
            else {
                vec.push(0);
            }
        }
        vecs.push(vec);
    }
    return vecs;
}


/*
 * Create a list of tf-idf vectors and a list of total frequencies to
  * from a list of frequency vectors and a list of vocabulary.
  * Receive an array of integer arrays and an array of strings, and return a
  * array of float array and an array of ints.
 */
function tfidf_vectorize(count_vectors, vocabulary) {
    const count_sums = count_vectors.reduce(function(total, vec) {
        for (var i=0; i<total.length; ++i) {
            total[i] += vec[i];
        }
        return total;
    }, new Array(vocabulary.length).fill(0));

    //deep copy of count_vectors to mutate to tf-idf vectors.
    var cvc = JSON.parse(JSON.stringify(count_vectors));
    for (var i=0; i<cvc.length; ++i) {
        var doc_length = cvc[i].filter(i => i != 0).length;
        for (var j=0; j<cvc[i].length; ++j) {
            // TF: there are several options, a typical one and the one we use here is
             // frequency of the term in the document divided by the length of the
             // document.
            var tf = cvc[i][j] / doc_length;
            // IDF: number of documents divided by the frequency of the term
             // in all documents.
            var idf = Math.log2(cvc.length / count_sums[j]);
            cvc[i][j] = tf * idf;
        }
    }
    return [cvc, count_sums];
}


/*
  * Calculate the cosine similarity of two vectors. Receive a list of floats,
  * returns a float between 0 and 1.
*/
function cosine_similarity(vec1, vec2) {
    var dot_product = 0;
    for (var i=0; i<vec1.length; ++i) {
        dot_product += vec1[i] * vec2[i];
    }
    const magnitude1 = Math.sqrt(vec1.reduce((x, y) => x + y**2, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((x, y) => x + y**2, 0));
    return dot_product / (magnitude1 * magnitude2)
}


/*
  * Makes a tf-idf vector of a query and the vocabulary list, number of
  * Model documents and word frequency count. Receive a string,
  * an array of strings, an int and an object whose keys are words of the
  * vocabulary of the model and their respective frequencies. Returns an array
  * from floats.
  */
 
function query_vectorize(query, vocab, model_num_docs, model_word_counts) {
    const qtoks = tokenize_docs([query])[0];
    const count_vec = count_vectorize([qtoks], vocab)[0];
    var tfidf_vec = new Array(vocab.length).fill(0);
    for (var i=0; i<count_vec.length; ++i) {
        var tf = count_vec[i] / count_vec.length;
        var idf = Math.log2(model_num_docs / model_word_counts[i]);
        tfidf_vec[i] = tf * idf;
    }
    return tfidf_vec;
}

function main(documents) {
    const tokenized = tokenize_docs(documents);
    const lexicon = vocabulary(tokenized);
    const count_vecs = count_vectorize(tokenized, lexicon);
    const [tfidf_vecs, word_freqs] = tfidf_vectorize(count_vecs, lexicon);

    const query = function (text) {
        query_vec = query_vectorize(
                text, lexicon, tfidf_vecs.length, word_freqs);
        var ranked = [];
        for (var i=0; i<tfidf_vecs.length; ++i) {
            ranked.push([cosine_similarity(query_vec, tfidf_vecs[i]), documents[i]]);
            console.log([cosine_similarity(query_vec, tfidf_vecs[i]), documents[i]]);
        }
        return ranked.sort((x, y) => y[0] - x[0]);
    }

    const s3 = 'Frodo and Sam are trekking to Mordor to destroy the One Ring of Power while Gimli, Legolas and Aragorn search for the orc-captured Merry and Pippin. All along, nefarious wizard Saruman awaits the Fellowship members at the Orthanc Tower in Isengard.';
    const s1 = 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Saurons forces. Meanwhile, Frodo and Sam take the ring closer to the heart of Mordor, the dark lords realm.';
    
    query(s1);
}


async function fetchMovieData (startPage, totalPages){
    let arr = [];
    
    for(pi =  startPage; pi <= totalPages; ++pi){
        
        
        let page = pi.toString();
        const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&page=${page}`);
        
        for(i = 0 ; i < response.data.results.length; ++i){
            // console.log(response.data.results[i]);

            let {release_date, adult, id, overview, original_language, 
                title, vote_average, vote_count, poster_path} = response.data.results[i];

            arr.push(overview);
        }
    }
    console.log(arr);

    main(arr);
}

fetchMovieData(1, 1);
        

// console.log(main([s1, s3]));