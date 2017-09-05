"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ReactBootstrap = ReactBootstrap;
var Alert = _ReactBootstrap.Alert;
var Button = _ReactBootstrap.Button;
var ControlLabel = _ReactBootstrap.ControlLabel;
var FormControl = _ReactBootstrap.FormControl;
var FormGroup = _ReactBootstrap.FormGroup;
var ListGroup = _ReactBootstrap.ListGroup;
var ListGroupItem = _ReactBootstrap.ListGroupItem;
var Modal = _ReactBootstrap.Modal;
var Tab = _ReactBootstrap.Tab;
var Tabs = _ReactBootstrap.Tabs;
var Well = _ReactBootstrap.Well;

var NewRecipe = function (_React$Component) {
  _inherits(NewRecipe, _React$Component);

  function NewRecipe(props) {
    _classCallCheck(this, NewRecipe);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      newName: "",
      newIngredients: "",
      editing: null
    };
    return _this;
  }

  //Automatically populate fields when editing a recipe

  NewRecipe.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.editing) {
      this.setState({
        newName: nextProps.editing.name,
        newIngredients: nextProps.editing.ingredients.join(", "),
        editing: true
      });
    }
  };

  // Capitalize all appropriate words in a phrase

  NewRecipe.prototype.capitalizePhrase = function capitalizePhrase(str) {
    // regEx to prevent incorrect capitalization
    var regExWords = /(and|the|tsp|oz)/gi;
    return str
    // Trim and split string into array of words
    .trim().split(" ")
    /* Only capitalize first word and longer words, also using regEx
    to prevent incorrectly capitalizing certain words */
    .map(function (word, i) {
      return i === 0 && word || word.length > 2 && !regExWords.test(word) ? word = word[0].toUpperCase() + word.slice(1) : word;
    })
    // Reassemble array of words into one string
    .join(" ");
  };

  // Extract and format comma-separated words into array

  NewRecipe.prototype.extractWords = function extractWords(str) {
    var _this2 = this;

    return str
    // Split string into array, based on commas
    .split(",")
    // Capitalize each phrase in array
    .map(function (phrase) {
      return _this2.capitalizePhrase(phrase);
    })
    // Remove empty entires
    .filter(function (phrase) {
      return phrase.length;
    });
  };

  // Check for valid input (called by validateName and validateIngredients)

  NewRecipe.prototype.validInput = function validInput(str) {
    var regExLetters = /[a-z]/gi;
    var regExChars = /[<>{}`\\]/gi;
    return !str.length || regExLetters.test(str) && !regExChars.test(str);
  };

  // Validate recipe name input field

  NewRecipe.prototype.validateName = function validateName() {
    var name = this.state.newName;
    return !this.validInput(name) || name.length > 80 ? "error" : null;
  };

  // Validate recipe ingredients input field

  NewRecipe.prototype.validateIngredients = function validateIngredients() {
    var ingredients = this.state.newIngredients;
    return !this.validInput(ingredients) || ingredients.length > 500 || ingredients.length > 10 && ingredients.includes(" ") && !ingredients.includes(",") ? "error" : null;
  };

  // Cancel potential edits

  NewRecipe.prototype.cancelEdit = function cancelEdit() {
    var _this3 = this;

    // Reset state to clear the form (delayed to prevent flicker)
    setTimeout(function () {
      return _this3.setState({ newName: "", newIngredients: "", editing: null });
    }, 500);
    // Exit editing mode in parent, which will reactivate disabled tabs
    this.props.onExitEditing();
  };

  // Format and save recipe in localStorage

  NewRecipe.prototype.saveRecipe = function saveRecipe() {
    // First, check for invalid/empty fields
    if (this.validateName() || this.validateIngredients() || !this.state.newName.trim().length || !this.state.newIngredients.trim().length) {
      return this.props.onAlert();
    }
    // Format new recipe
    var newRecipe = this.capitalizePhrase(this.state.newName);
    // Get current recipes from localStorage
    var currentRecipes = JSON.parse(localStorage.getItem("rvrvrv-recipes")) || {};
    // Check if new recipe already exists (when not editing a recipe)
    if (currentRecipes.hasOwnProperty(newRecipe) && !this.state.editing) {
      return this.props.onAlert("A recipe for " + newRecipe + " already exists.");
    }
    // Add new/modified recipe to the list
    currentRecipes[newRecipe] = this.extractWords(this.state.newIngredients);
    // Update localStorage and state of parent
    localStorage.setItem("rvrvrv-recipes", JSON.stringify(currentRecipes));
    this.props.onSave();
    // If editing a recipe, exit edit mode
    if (this.state.editing) this.props.onExitEditing();
    // If saving a new recipe, switch to newly created tab
    this.props.onChangeTab(newRecipe);
    // Alert user of successful save/edit and restore initial state
    this.props.onAlert("Your recipe for " + newRecipe + " has been " + (this.state.editing ? 'updated' : 'saved') + ".", "success");
    this.setState({ newName: "", newIngredients: "", editing: null });
  };

  NewRecipe.prototype.handleNameChange = function handleNameChange(e) {
    this.setState({ newName: e.target.value });
  };

  NewRecipe.prototype.handleIngredientsChange = function handleIngredientsChange(e) {
    this.setState({ newIngredients: e.target.value });
  };

  NewRecipe.prototype.render = function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "form",
        { style: { marginTop: 10 } },
        React.createElement(
          FormGroup,
          { controlId: "name", validationState: this.validateName() },
          React.createElement(
            ControlLabel,
            null,
            "Recipe for:"
          ),
          React.createElement(FormControl, {
            placeholder: "Lasagna",
            value: this.state.newName,
            onChange: this.handleNameChange.bind(this)
          })
        ),
        React.createElement(
          FormGroup,
          {
            controlId: "ingredients",
            validationState: this.validateIngredients()
          },
          React.createElement(
            ControlLabel,
            null,
            "Ingredients (separated by commas):"
          ),
          React.createElement(FormControl, {
            componentClass: "textarea",
            placeholder: "Pasta, Ricotta Cheese, Garlic...",
            value: this.state.newIngredients,
            onChange: this.handleIngredientsChange.bind(this)
          })
        ),
        React.createElement(
          Button,
          { bsStyle: "success", onClick: this.saveRecipe.bind(this) },
          "Save"
        ),
        " ",
        this.props.editing && React.createElement(
          Button,
          { onClick: this.cancelEdit.bind(this) },
          "Cancel Changes"
        )
      )
    );
  };

  return NewRecipe;
}(React.Component);

// Inner content of each recipe

var RecipeBody = function (_React$Component2) {
  _inherits(RecipeBody, _React$Component2);

  function RecipeBody() {
    _classCallCheck(this, RecipeBody);

    var _this4 = _possibleConstructorReturn(this, _React$Component2.call(this));

    _this4.state = {
      deleteModal: false
    };
    return _this4;
  }

  // Open the delete modal

  RecipeBody.prototype.openModal = function openModal(e) {
    var _setState;

    this.setState((_setState = {}, _setState[e.target.value] = true, _setState));
  };

  // Close the delete modal

  RecipeBody.prototype.closeModal = function closeModal(e) {
    var _setState2;

    this.setState((_setState2 = {}, _setState2[e.target.value] = false, _setState2));
  };

  // Load the add-recipe tab with the current recipe

  RecipeBody.prototype.editRecipe = function editRecipe() {
    this.props.onEdit(this.props.name, this.props.ingredients);
  };

  // Delete the recipe

  RecipeBody.prototype.deleteRecipe = function deleteRecipe() {
    // Get all recipes from localStorage
    var currentRecipes = JSON.parse(localStorage.getItem("rvrvrv-recipes"));
    // Delete the recipe
    delete currentRecipes[this.props.name];
    // Update localStorage
    localStorage.setItem("rvrvrv-recipes", JSON.stringify(currentRecipes));
    // Update parent state
    this.props.onSave();
    // Close the modal and notify the user
    this.closeModal({ target: { value: "deleteModal" } });
    this.props.onAlert("The recipe for " + this.props.name + " has been deleted.", "success");
    // Switch to the add-recipe tab
    this.props.onChangeTab("add-recipe");
  };

  RecipeBody.prototype.render = function render() {
    // Generate list of ingredients
    var ingredientList = this.props.ingredients.map(function (item) {
      return React.createElement(
        ListGroupItem,
        {
          href: "https://google.com/search?q=" + item,
          target: "_blank"
        },
        item
      );
    });

    return React.createElement(
      "div",
      null,
      React.createElement(
        "h3",
        { className: "text-center" },
        this.props.name
      ),
      React.createElement(
        ListGroup,
        null,
        ingredientList
      ),
      React.createElement(
        "div",
        { className: "text-center" },
        React.createElement(
          Button,
          { onClick: this.editRecipe.bind(this) },
          "Edit Recipe"
        ),
        " ",
        React.createElement(
          Button,
          { onClick: this.openModal.bind(this), value: "deleteModal" },
          "Remove Recipe"
        )
      ),
      React.createElement(
        Modal,
        {
          show: this.state.deleteModal,
          onHide: this.closeModal.bind(this)
        },
        React.createElement(
          Modal.Header,
          null,
          React.createElement(
            Modal.Title,
            { id: "contained-modal-title" },
            "Remove ",
            this.props.name
          )
        ),
        React.createElement(
          Modal.Body,
          null,
          "Are you sure you want to remove the recipe for ",
          this.props.name,
          "?"
        ),
        React.createElement(
          Modal.Footer,
          null,
          React.createElement(
            Button,
            {
              onClick: this.deleteRecipe.bind(this),
              value: "deleteModal",
              bsStyle: "danger"
            },
            "Yes, remove it"
          ),
          React.createElement(
            Button,
            { onClick: this.closeModal.bind(this), value: "deleteModal" },
            "No"
          )
        )
      )
    );
  };

  return RecipeBody;
}(React.Component);

var RecipeBook = function (_React$Component3) {
  _inherits(RecipeBook, _React$Component3);

  function RecipeBook() {
    _classCallCheck(this, RecipeBook);

    var _this5 = _possibleConstructorReturn(this, _React$Component3.call(this));

    _this5.state = {
      alert: null,
      editing: null,
      key: "add-recipe"
    };
    return _this5;
  }

  // Change the active tab (via the key)

  RecipeBook.prototype.handleSelect = function handleSelect(key) {
    this.setState({ key: key });
  };

  // Populate the add-recipe fields for editing

  RecipeBook.prototype.handleEdit = function handleEdit(name, ingredients) {
    this.setState({
      editing: {
        name: name,
        ingredients: ingredients
      }
    });
    // Switch to the add-recipe tab
    this.handleSelect("add-recipe");
  };

  // Exit editing mode

  RecipeBook.prototype.handleExitEditing = function handleExitEditing() {
    // Switch back to the chosen recipe tab
    this.handleSelect(this.state.editing.name);
    // Exit editing mode
    this.setState({ editing: null });
  };

  // Display an alert for 3 seconds

  RecipeBook.prototype.showAlert = function showAlert() {
    var _this6 = this;

    var msg = arguments.length <= 0 || arguments[0] === undefined ? "Please enter a valid recipe name and ingredients." : arguments[0];
    var style = arguments.length <= 1 || arguments[1] === undefined ? "danger" : arguments[1];

    this.setState({
      alert: React.createElement(
        Alert,
        { bsStyle: style },
        React.createElement(
          "strong",
          null,
          style === "danger" && "Oops!" || style === "success" && "Success!",
          " "
        ),
        msg
      )
    });
    setTimeout(function () {
      return _this6.setState({ alert: null });
    }, 3000);
  };

  // Generate tabs in recipe book

  RecipeBook.prototype.recipeTabs = function recipeTabs() {
    var _this7 = this;

    return Object.keys(this.props.recipes).map(function (item, i) {
      return React.createElement(
        Tab,
        { eventKey: item, title: item, disabled: !!_this7.state.editing },
        React.createElement(RecipeBody, {
          name: item,
          ingredients: _this7.props.recipes[item],
          onAlert: _this7.showAlert.bind(_this7),
          onEdit: _this7.handleEdit.bind(_this7),
          onChangeTab: _this7.handleSelect.bind(_this7),
          onSave: _this7.props.onSave.bind(_this7)
        })
      );
    });
  };

  RecipeBook.prototype.render = function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        Well,
        null,
        React.createElement(
          Tabs,
          {
            activeKey: this.state.key,
            onSelect: this.handleSelect.bind(this)
          },
          this.recipeTabs(),
          React.createElement(
            Tab,
            {
              eventKey: "add-recipe",
              title: this.state.editing ? "Edit " + this.state.editing.name : "Add a Recipe"
            },
            React.createElement(NewRecipe, {
              onAlert: this.showAlert.bind(this),
              onChangeTab: this.handleSelect.bind(this),
              onSave: this.props.onSave.bind(this),
              onExitEditing: this.handleExitEditing.bind(this),
              editing: this.state.editing
            })
          )
        )
      ),
      this.state.alert
    );
  };

  return RecipeBook;
}(React.Component);

var RecipeBookContainer = function (_React$Component4) {
  _inherits(RecipeBookContainer, _React$Component4);

  function RecipeBookContainer() {
    _classCallCheck(this, RecipeBookContainer);

    var _this8 = _possibleConstructorReturn(this, _React$Component4.call(this));

    var sampleRecipes = {
      "Green Smoothie": ["1 Handful Spinach", "1 Frozen Banana", "½ Small Avocado", "¼ Cup Unsweetened Almond Milk", "½ tsp. Cinnamon"],
      "Hot Cocoa": ["2 Tbsp. Unsweetened Cocoa Powder", "1½ Tbsp. Sugar", "Pinch of Salt", "1 Cup of Milk", "¼ tsp. Vanilla Extract"]
    };
    // First, check for saved recipes. If none exist, load samples.
    if (!localStorage.getItem("rvrvrv-recipes") || localStorage.getItem("rvrvrv-recipes") === "{}") {
      localStorage.setItem("rvrvrv-recipes", JSON.stringify(sampleRecipes));
    }

    _this8.state = {
      recipes: JSON.parse(localStorage.getItem("rvrvrv-recipes"))
    };
    return _this8;
  }

  // Update recipes

  RecipeBookContainer.prototype.updateRecipes = function updateRecipes() {
    this.setState({
      recipes: JSON.parse(localStorage.getItem("rvrvrv-recipes"))
    });
  };

  RecipeBookContainer.prototype.render = function render() {
    return React.createElement(RecipeBook, {
      recipes: this.state.recipes,
      onSave: this.updateRecipes.bind(this)
    });
  };

  return RecipeBookContainer;
}(React.Component);

var App = function (_React$Component5) {
  _inherits(App, _React$Component5);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, _React$Component5.apply(this, arguments));
  }

  App.prototype.render = function render() {
    return React.createElement(
      "div",
      { className: "container" },
      React.createElement(
        "h1",
        { className: "text-center text-success" },
        React.createElement("i", { className: "fa fa-cutlery", "aria-hidden": "true" }),
        React.createElement("br", null),
        "Recipe Book"
      ),
      React.createElement(RecipeBookContainer, null)
    );
  };

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById("app"));