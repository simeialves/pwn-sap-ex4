const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        //ssl: process.env.DATABASE_URL ? true : false
        ssl: {
            rejectUnauthorized: false
        },
    }
})

//INSERT
// knex('produto')
//     .insert({
//         descricao: 'Leite', 
//         valor: 8.50,
//         marca: 'Itambé'},['id'])
//     .then(produtos => {console.log(produtos[0].id)})

//DELETE
// knex.where({id: 10}).delete().table("produto").then(data=>{
//     console.log(data);
// }).catch(err => {
//     console.log(err);
// })

//UPDATE
knex.where({id: 5}).update({valor: 40}).table("produto").then(produtos => {
    console.log(produtos);
}).catch(err => {
    console.log(err);
})