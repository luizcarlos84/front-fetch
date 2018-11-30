const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId;


const bodyParse = require('body-parser');
const urlencodedParser = bodyParse.urlencoded({extended : true});

const userdb = require('../db/userdb');


//  ------------------------ Variaveis Controle ------------------------



/* Gera um novo codigo aleatório */
codeGen = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let pass = ''
    for(let i = 0; i < 9; i++)
      pass += chars.charAt(Math.random() * 61)
    return pass
}





/* Verifica se o usuário realizou login */
isAuth = (req, res, next) => {
  if(req.user)
     return next();
  else
     res.redirect('/login')
}






/* Verificar se existe login ativo e informa na varivel local */
var loggedIn = (req, res, next) => {

  res.locals.loggedIn = (req.user) ? true : false;
  next();
}






/* Cria o usuário na tela de registro */
var registerPost = (req, res, next) => {

  userdb.insertUser(req.body.InputUserName, req.body.InputPassword, req.body.InputEmail, (err, result) => {
    if(err) res.redirect('/register?fail=true');
    res.redirect('/login');
  })
};






/* Insere novas carteiras no usuario */
var insertWallet = (req, res, next) => {

  userdb.insertPending(req.user._id, req.body.InputWallet);

  userdb.insertWallet(req.user._id, req.body.InputWallet, (err, result) => {
    if(err) res.redirect('?fail=true');
    res.redirect('/');
  })
}



/* remove carteiras no usuario */
var removeWalletUser = (req, res, next) => {
  if(req.method == 'GET'){
    userdb.removeWalletUser(req.user._id, req.params.walletId, (err, doc) => {
      if(err)
        res.redirect('?error=true');

      else{
        if(doc == null)
          res.redirect('?noExist=true');

        else
          next();
      }
    })
  }
}






/* Verifica se a carteira existe */
var walletHaveOwn = (req, res, next) => {

  userdb.findWalletAllUser(req.user._id, req.body.InputWallet, (err, result) => {
    if(err)
      res.redirect('wallet?error=true');
    else {
      if(result == null)
        next();

      else{
        if (typeof(result._id) == 'object'){

          if( Object.is(JSON.stringify(result._id), JSON.stringify(req.user._id)) )
            res.redirect('wallet?AlreadyOwn=true');

          else
            res.redirect('wallet?haveUser=true');

        }
      }
    }
  })
}







/* retorna as informações se existir */
var walletInfo = (req, res, callback) => {

  if(req.method == 'GET'){
    if(req.params.walletId){
      userdb.findWalletInfo(req.params.walletId, (err, doc) =>{
        if(err)
          res.redirect('?error=true');

        else{
          if(doc == null)
            res.redirect('?noExist=true');

          else
            callback(doc);
        }
      });
    }
  }
}






var findwalletDashboard = (req, res, callback) => {

  userdb.findwalletDashboard(req.user.wallets, (err, doc) => {
    console.log(err, doc);
    callback(err, doc);
  })
}





// Cria um código busca sem login
var insertCode = (req, res, next) => {

  userdb.insertCode(req.user._id, (err, result) => {
    if(err) res.redirect('?fail=true');
    next();
  })
}





// Busca por um codigo gerado por algum usuário
var findCode = (req, res, callback) => {

  if(req.method == 'GET'){
    userdb.findCode(req.params.inputCode, (err, doc) => {
      if(err) res.redirect('/profile?fail=true');
      callback(err, doc);
    })
  }
  else if (req.method == 'POST'){
    userdb.findCode(req.body.InputCode, (err, doc) => {
      if(err) res.redirect('/profile?fail=true');
      callback(err, doc);
    })
  }

}






// Encontra codigos gerados pelo usuário
var findCodeById = (req, res, callback) => {

  // Testar a busca
  userdb.findCodeById(req.user._id, (err, doc) => {
    callback(err, doc);
  })
}

var updatePasswd = (req, res, next) => {

  userdb.updatePasswd(req.user._id, req.body.InputPassword, (err, doc) => {
    if (err) console.log(err);
    next()
  })
}




var scoreHolder = ( req, res, next ) => {
  let exchange = [] //filtra e armazena as transações da busca em objetos,
      total = 0, // tempo de investimento somado todos os periodos
      saldo = 0, //armazena um saldo quando depositado
      agora = Math.round(Date.now()/1000), //tempo exato das transações (epoch)
      tempoInicial = 0, //Data primeira transação (epoch)
      tempoFinal = 0, //Data Ultima transação (epoch)
      tempoMedio = 0,  // Periodo de tempo inicial e final
      periodo = [], // RESULTADO: armazena o período de cada transação normalmente o out é zero
      percent = [], // RESULTADO: armazena a percentagem a ser somada.
      score = 0; //RESULTADO: o valor do Score


  let orderScore = (err, array) => {

    // Organiza as transações dentro da array exchange
    if(array){
      array.forEach( element => {

        if(element.score.exchange){
          element.score.exchange.forEach( element1 => {

            exchange.push(element1)

          });
        }
        else {
          console.log('orderScore:', element._id, 'Sem avaliação. Aguardar');
          clearScore();
        }


      });
    }
    else {
      console.log('orderScore:'.blue, 'Array vazia');
      clearScore();
    }




    // Colocar na ordem do mais antigo ao mais recente
    let compare = (a, b) => {
      if( a.time < b.time )
        return -1;
      if( a.time > b.time )
        return 1;
      return 0;
    }

    // Executa o compare
    exchange.sort(compare);

    // As arrays com os objetos usam map para criar uma array de variavel time
    if(exchange[exchange.length - 1].out)
      tempoFinal = agora;
    else
      tempoFinal = Math.max.apply(Math, exchange.map( x => {return x.time}));

    tempoInicial = Math.min.apply(Math, exchange.map( x => {return x.time}));
    tempoMedio = agora - tempoInicial;

    calcScore(array);
  }


  let calcScore = (array) => {


    /* Calcula e insere o tempo de investimento na array periodo */
    let calcPeriodo = (element, index) => {
      if(index == 0){

        // normalmente a carteira inicia com uma entrada
        if(element.out){
          saldo += element.out;
          parcial = tempoInicial;

          return 0;
        }

      }
      else if( index < (exchange.length - 1)){


        if(element.out){

          if(saldo > 0){
            saldo += element.out;

            return 0;
          }
          else{
            parcial = element.time;
            saldo += element.out;

            return 0;
          }

        }

        if(element.input){

          saldo -= element.input;

          if(saldo > 0){

            return 0;
          }
          else{

            return (element.time - parcial);
          }

        }


      }
      else {

        if(element.out){

          saldo += element.out;

          return (tempoFinal - element.time);

        }

        if(element.input){

          saldo -= element.input;

          if(saldo > 0){

            return 0;
          }
          else{

            return (element.time - parcial);
          }

        }

      }

    }//calcPeriodo
    let parcial;
    periodo = exchange.map( calcPeriodo );

    let reducer = (total, soma) => {
      return total + soma
    }

    // Soma os periodos e armazena em total
    total = periodo.reduce( reducer );

    //
    exchange.forEach( (element, index) => {

      // as variaveis exchange e periodo possuem o mesmo tamanho
      if(exchange.length == periodo.length){

        Object.assign( element , {periodo: periodo[index]})
      }
    })


    percentScore( array );
  }


  let percentScore = (array) => {

    /* calcPercent = Realiza o um calculo entre cada periodo de debito e credito
       e retorna um score baseado no tempo inicial e final.
       calcPercent tem atributo LET para existir apenas na função scoreHolder */
    let calcPercent = ( tempoParcial ) => {



      // Transaforma em percentagem
      let x = (tempoParcial * 100) / tempoMedio;



      /* Utiliza uma função de desvio padrão. pode ser usado funções matermaticas
       para dar maior pontuação a transações mais recentes.
       A variação abaixo é uma função de 1º grau com retorno entre 0,66 a 1,66*/
      let y = ( (3 * x) + 200 ) / 300;


      // return (x * y)
      return ( x );
    }

    // Calcula o score e armazena na array percent
    let sortPercent = (element, index) => {
      // console.log('calcPercent', element, index);
      let x = calcPercent(element)

      if(element > 0){
        return x;
      }
      else{
        return 0;
      }
    }

    // armazena as percentagem em array
    percent = periodo.map( sortPercent )

    // realiza a soma dos valores em uma array
    let reducer = (total, soma) => {
      return total + soma
    }

    // armazena a soma em uma variavel
    score = percent.reduce( reducer );


    exchange.forEach( (element, index) => {

      // as variaveis exchange e periodo possuem o mesmo tamanho
      if(exchange.length == percent.length){

        Object.assign( element , {percent: percent[index]})
      }
    })


    saveScore(array);
  }


  let saveScore = (array) => {
    // Salva ou atualiza a reputação na carteira

    let temp = [];

    exchange.forEach((element, index) => {
      if(element.out)
        temp.push({
          "time"   : element.time,
          "out"    : element.out,
          "periodo": element.periodo,
          "percent": element.percent
        })
      else {
        temp.push({
          "time"   : element.time,
          "input"    : element.input,
          "periodo": element.periodo,
          "percent": element.percent
        })
      }
    })

    // console.log(temp);
    // console.log(score);

    userdb.updateUser( req.user._id ,{
      $set: {
        'score.timestamp': Date.now(),
        'score.score' : score
      },
      $push: {
        'score.exchange': {
          $each: temp,
          $sort: {time: -1}
        }
      }
    });


    resultScore();
  }


  let resultScore = () => {

      // Resultados para visualização no console
      console.log('exchange\n', exchange);
      console.log('agora', agora);
      console.log('score', score );
      console.log('data atual', Math.round(agora), new Date(Date.now()).toDateString());
      console.log('Data inicio', tempoInicial, new Date(tempoInicial * 1000).toDateString());
      console.log('Data Final', tempoFinal, new Date(tempoFinal * 1000).toDateString());
      console.log('Tempo total de investimento(segundos)', tempoMedio );
      console.log('Tempo investindo(segundos)', total);
      console.log('Tempo sem investir(segundos)', tempoMedio - total );
      console.log('Porcentagem tempo de investimento', (total *100) / tempoMedio );
      console.log('score', score.toFixed(2));

      clearScore();
  } //resultScore


  let clearScore = () => {

    exchange.splice(0); //filtra e armazena as transações da busca em objetos,
    total = 0; // tempo de investimento somado todos os periodos
    saldo = 0; //armazena um saldo quando depositado
    agora = Math.round(Date.now()/1000); //tempo exato das transações (epoch)
    tempoInicial = 0; //Data primeira transação (epoch)
    tempoFinal = 0; //Data Ultima transação (epoch)
    tempoMedio = 0;  // Periodo de tempo inicial e final
    periodo.splice(0); // RESULTADO: armazena o período de cada transação normalmente o out é zero
    percent.splice(0); // RESULTADO: armazena a percentagem a ser somada.
    score = 0;
  }

  //Subrair em milisegundos (segundo * 1000)
  let cronos = Date.now() - 3600000;
  // Variaveis para o banco

  let query = { 'owner' : {$eq : req.user._id}};


  userdb.findWalletScore(query, (err, array) => {

    if(array.length > 0){
      /* O Objetivo é que cada valor na array tenha um espaço de tempo
      para a execução. Então cada elemento tera um espaço de 5 segundos*/
      orderScore(err, array);

    }

    else {
      console.log('scoreHolder:'.blue, 'Sem atualizações');
    }

    next();

  });//findWallet

} //scoreHolder


var clearScoreHolder = (req, res, next) => {

  userdb.clearScoreHolder( req.user._id, req.user.score.exchange);

  next()

}


/* ----------------------- exports ---------------------- */

module.exports.isAuth = isAuth;
module.exports.loggedIn = loggedIn;
module.exports.codeGen = codeGen;

module.exports.insertWallet = insertWallet;
module.exports.removeWalletUser = removeWalletUser;
module.exports.registerPost = registerPost;
module.exports.walletHaveOwn = walletHaveOwn;
module.exports.walletInfo = walletInfo;
module.exports.findwalletDashboard = findwalletDashboard;

module.exports.findCode = findCode;
module.exports.findCodeById = findCodeById;
module.exports.insertCode = insertCode;

module.exports.updatePasswd = updatePasswd;

module.exports.scoreHolder = scoreHolder;
module.exports.clearScoreHolder = clearScoreHolder;
