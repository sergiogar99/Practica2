import { GraphQLServer} from 'graphql-yoga';

const recipesData = [{

  title: "Sandwich Mixto",
  description: "Hacemos un sandwich de Jamón y Queso, y lo introducimos en la Sandwichera, fácil y sencillo.",
  date: "01/01/0000",
  author: "Arguiñano",
  ingredients: ["Jamon,Queso,Pan"]

}];
const authorsData = [{

  name: "Arguiñano",
  mail: "Arguiñano@gmail.com"
  
}];
const ingredientsData = [{

  name: "Jamon",
  recipe: "Sandwich Mixto"

}];

const typeDefs = `

  type Recipe{

    title: String!
    description: String!
    date: String!
    author: [Author!]
    ingredients:[Ingredient!]

  }

  type Author{

    name: String!
    mail: String!
    recipes: [Recipe!]

  }

  type Ingredient{

    name: String!
    recipe: [Recipe!]

  }

  type Query{

    list_recipes: [Recipe!]
    list_authors: [Author!]
    list_ingredients: [Ingredient!]

    recipes_author(name:String!):[Author!]
    recipes_ingredient(ingredient:String!):[Ingredient!]
  }

  type Mutation{

    addRecipe(title:String!,description:String!,author:String!,ingredients:[String!]):Recipe!
    addAuthor(name:String!,mail:String!):Author!
    addIngredient(name:String!,recipe:String!):Ingredient!

    remove_recipe(title:String!):String!
    remove_author(name:String!):String!
    remove_ingredient(name:String!):String!

    update_author:Author!
    update_recipe:Recipe!
    update_ingredient:Ingredient!

  }
  `
  // Borrar una receta.
  // Borrar un autor. Al borrar un autor, se borran todas sus recetas.
  // Borrar un ingrediente. Al borrar un ingrediente, se borran todas las recetas que lo contengan.
  // Actualizar datos de un autor.
  // Actualizar datos de una receta.
  // Actualizar datos de un ingrediente.


const resolvers = {

  Recipe:{

    ingredients: (parent, args, ctx, info)=>{

      const title = parent.title;

      return ingredientsData.filter(obj => obj.recipe == title);

    },

    author:(parent, args, ctx, info)=>{

      const author_name = parent.author;

      return authorsData.filter(obj => obj.name == author_name);


    },

  },

  Author:{

    recipes: (parent, args, ctx, info)=>{

      const name = parent.name;

      return recipesData.filter(obj => obj.author == name);

    },

  },

  Ingredient:{

    recipe: (parent, args, ctx, info)=>{

      const name = parent.recipe;

      return recipesData.filter(obj => obj.title == name);

    },

  },

  Query:{

    list_recipes(){

      return recipesData;

    },
    list_authors(){

      return authorsData;
    },
    list_ingredients(){

      return ingredientsData;
    },

    recipes_author(parent, args, ctx, info){

      const name = args.name;

      return authorsData.filter(obj => obj.name == name);

    },

    recipes_ingredient(parent, args, ctx, info){

      return ingredientsData.filter(obj => obj.name == args.ingredient);

    }

  },

  Mutation:{

    addAuthor(parent, args, ctx, info){

      //Listo

      const {name,mail} = args; 

      if(authorsData.some(obj => obj.mail === mail)){//Devuelve true o false

        throw new Error ('User email' + mail + 'already in use');

      }

      if(authorsData.some(obj => obj.name === name)){//Devuelve true o false

        throw new Error ('User name' + name + 'already in use');

      }

      const author = {

        name,
        mail
        
      }

      authorsData.push(author);
      return author;

    },

    addRecipe(parent, args, ctx, info){

      //Listo

      const{title,description,author,ingredients} = args;

      if(recipesData.some(obj => obj.title === title)){//Devuelve true o false

        throw new Error ('Recipe: ' + title + 'already in use');

      }

      if(!authorsData.some(obj => obj.name === author)){//Devuelve true o false

        throw new Error ('Author: ' + author + 'doesnt exist');

      }

      const date = new Date().getDate();

      const recipe = {

        title,
        description,
        date, 
        author
        
      }

      const array = ingredients;

      array.forEach((elem) =>{

        const ingredient_l = {

          name:elem,
          recipe:title
  
        }

        ingredientsData.push(ingredient_l);
        
      });

      
      recipesData.push(recipe);
      return recipe;

    },

    addIngredient(parent, args, ctx, info){

      //Solo se puedan añadir ingredientes a recetas ya creadas
      //Listo

      const{name,recipe} = args;

      if(recipesData.some(obj => obj.title === recipe)){

        const ingredient = {

          name,
          recipe
  
        }
  
        ingredientsData.push(ingredient);

        return ingredient;

      }else{
        
        throw new Error ('Title: ' + recipe + 'dont exist');

      }

    },

    remove_recipe(parent, args, ctx, info){
     
      const receta = args.title;

      if(recipesData.some(obj => obj.title === receta)){
        //Eliminar Recetas

        let result = recipesData.find(obj => obj.title === receta);
        
        var index = recipesData.indexOf(result);

        if (index > -1) {
          recipesData.splice(index, 1);
        }

        //Eliminar Ingredientes


        for(var i = 0; i < ingredientsData.length; i++){ 

          if (ingredientsData[i].recipe === receta) {
            ingredientsData.splice(i, 1); 
            i--;
          }

        }


        return ("Eliminado con Exito");

      }else{

        return ("No existe");

      }

    },
    remove_author(parent, args, ctx, info){
      
      const nombre = args.name;

      if(authorsData.some(obj => obj.name === nombre)){

        //Eliminar Autor
        
        let result = authorsData.find(obj => obj.name === nombre);
        var index = authorsData.indexOf(result);

        if (index > -1) {
          authorsData.splice(index, 1);
        }

        //Eliminar Recetas

        
        for(var i = 0; i < recipesData.length; i++){

          if (recipesData[i].author === nombre) {

            var receta = recipesData[i].title;

            recipesData.splice(i, 1); 
            i--;

            for(var j = 0; j < ingredientsData.length; j++){ 

              if (ingredientsData[j].recipe === receta) {
                ingredientsData.splice(j, 1); 
                j--;
              }
  
            }
          
          }
        }

        return ("Eliminado con Exito");

      }else{

        return ("No existe");

      }
      
    },
    remove_ingredient(parent, args, ctx, info){
      //name:String!
      //return String
    },

  },

}

const server = new GraphQLServer({typeDefs, resolvers})
server.start({port: "3007"})
