const mongo = require('mongodb');

const client = new mongo.MongoClient('mongodb://localhost:27017', { useNewUrlParser: true });

function addNewToDo(todosCollection, title) {
    todosCollection.insertOne({
        title: title,
        done: false,
    }, err => {
        if (err) {
            console.log("błąd podczas dodawania", err)
        } else {
            console.log("zadanie dodane ")
        }
        client.close();
    })


    // do naszej funkcji przekazujemy całą kolekcję bo na niej wykonujemy działania oraz przekazujemy title, który będzie tym elementem 

}
function showAllTodos(todosCollection) {
    todosCollection.find({}).toArray((err, todos) => {
        if (err) {
            console.log("błąd podczas dodawania", err)
        } else {

            const todosToDo = todos.filter(todo => !todo.done);
            const todosDone = todos.filter(todo => todo.done);
            console.log(`#Lista zadań do zrobienia (niezakończone): ${todosToDo.length}`);
            for (const todo of todosToDo) {
                console.log(`- [${todo._id}] ${todo.title} `)
            }
            console.log(`#Lista zadań zrobionych - zakończone: ${todosDone.length} `);

            for (const todo of todosDone) {
                console.log(`- [${todo._id}] ${todo.title}`);
            }
        }
        client.close();
    })
}

function markTaskAsDone(todosCollection, id) {
    todosCollection.find({ // jeżeli używany find to zawsze to co zostanie zwrócone musimy zamienić na tablicę 
        _id: mongo.ObjectID(id),
    }).toArray((err, todos) => {
        if (err) {

            console.log("błąd podczas pobierania", err);
            client.close();
        } else if (todos.length !== 1) {

            console.log(" nie ma takiego zadania ");
            client.close();

        } else if (todos[0].done) {
            // jeśli istnieje to zadanie ale jest ono już zakończone to:
            console.log(" to zadanie było już zakończone  ");
            client.close();

        } else {

            todosCollection.updateOne({
                _id: mongo.ObjectId(id),
            }, {
                $set: {
                    done: true,
                },
            }, err => {

                if (err) {

                    console.log("błąd podczas ustawiania zakończenia ", err)

                } else {

                    console.log("zadanie oznaczono jako zakończone  ")

                }
                client.close();
            })
        }
    })
}

function deleteTask(todosCollection, id) {
    todosCollection.find({ // jeżeli używany find to zawsze to co zostanie zwrócone musimy zamienić na tablicę 
        _id: mongo.ObjectID(id),
    }).toArray((err, todos) => {
        if (err) {

            console.log("błąd podczas pobierania", err);
            client.close();
        } else if (todos.length !== 1) {

            console.log(" nie ma takiego zadania ");
            client.close();

        } else {

            todosCollection.deleteOne({
                _id: mongo.ObjectId(id),
            }, err => {

                if (err) {

                    console.log("błąd podczas usuwania", err)

                } else {

                    console.log("zadanie usunięte")

                }
                client.close();
            })
        }
    })
}

function deleteAllDoneTask(todosCollection) {
    todosCollection.deleteMany({
        done: true,
    }, err => {

        if (err) {

            console.log("błąd podczas usuwania", err)

        } else {

            console.log("wyczyszczono zakończone zadania, o ile takie były")

        }
        client.close();
    })
}


function doTheToDo(todosCollection) {
    const [command, ...args] = process.argv.splice(2);
    // bierzemy trzeci argument, podstawiamy pod zmienna command a całą resztę pod tablic args
    switch (command) {
        case 'add':
            addNewToDo(todosCollection, args[0])
            break;
        case 'list':
            showAllTodos(todosCollection)
            break;
        case 'done':
            markTaskAsDone(todosCollection, args[0])
            break;
        case 'delete':
            deleteTask(todosCollection, args[0])
            break;
        case 'cleanup':
            deleteAllDoneTask(todosCollection)
            break;
        default:
            console.log(`
            ##### lista TO DO - MondoDB, aplikacja konsolowa ######
            Dostęne komendy:
            add <nazwa zadania> - dodaje zadanie do wykonania
            list - wyświetl zadania
            done - <id zadania> - oznacz zadanie jako zrobione
            delete - <id zadania> - usuń wybrane zadanie z bazy danych
            cleanup - usuń zakończone zadania jeżeli istnieją `);
            client.close();
            break;
    }



    // process.argv zwracał właności tablicy zawierającej argumenty wiersza poleceń, na pierwszym miejscu jest ścieżka execPath(user/local/bin/node), kolejny element to ścieżka do wykonywanego pliku JavaScript, kolejny element to to co my wpisujemy w terminalu, nam zależy na tym elemencie który wpiszemy w terminal - chcemy to przechwycić dlatego do zmiennej zapisujemy wynik funkcji process.argv.splice(2) -która oblica nam wszystko co jest od 2 indexu


    // w naszej zmiennej args, pierwszy argument, który posiada to jest nasza komenda, kolejne to parametry, które będziemy chcieli przekazać z terminala do naszej funkcji. Dlatego kożystamy z destrukturyzacji, która jest z operatorem reszty[command, ...args], dzięki temu command to będzie nasze polecenie a args to będą argumenty naszej funkcji

    // client.close();
}


client.connect(err => {
    if (err) {
        console.log("błąd połączenia ")
    } else {
        console.log("połączenie udane ");
        const db = client.db('test');
        const todosCollection = db.collection('todos');
        // tu wpisujemy kod - co będziemy robili z naszą bazą danych 
        doTheToDo(todosCollection);


    }

});



