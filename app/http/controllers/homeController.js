const Menu=require('../../models/menu');

function homeController() {
    //factory functions::function which returns objects
    return{ 
        async index(req,res) {
            const brownies=await Menu.find()
            return res.render("home",{brownies:brownies})

             /* Menu.find().then(function(brownies){
                console.log(brownies)
                res.render("home",{brownies:brownies})
            }) */
        }
    }
}

module.exports= homeController