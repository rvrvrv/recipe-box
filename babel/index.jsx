const {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ListGroup,
  ListGroupItem,
  Modal,
  Tab,
  Tabs,
  Well,
} = ReactBootstrap;

class NewRecipe extends React.Component {
  constructor() {
    super();
    this.state = {
      newName: '',
      newIngredients: '',
      alert: null,
    };
  }

  // Capitalize all appropriate words in a phrase
  capitalizePhrase(str) {
    // regEx to prevent incorrect capitalization
    const regEx = /(and|the)/gi;
    return (
      str
        // Trim and split string into array of words
        .trim()
        .split(' ')
        /* Only capitalize first word and longer words, also using regEx
        to prevent incorrectly capitalizing 'and' or 'the' */
        .map((word, i) => (i === 0 || (word.length > 2 && !regEx.test(word))
          ? (word = word[0].toUpperCase() + word.slice(1))
          : word))
        // Reassemble array of words into one string
        .join(' ')
    );
  }

  // Extract and format comma-separated words into array
  extractWords(str) {
    return (
      str
        // Split string into array, based on commas
        .split(',')
        // Capitalize each phrase in array
        .map(phrase => this.capitalizePhrase(phrase))
    );
  }

  // Show an alert for 3 seconds
  showAlert(msg = 'Please enter a valid recipe name and ingredients.') {
    this.setState({
      alert: (
        <div>
          <br />
          <Alert bsStyle="danger">
            <strong>Oops! </strong>{msg}
          </Alert>
        </div>
      ),
    });
    setTimeout(() => this.setState({ alert: null }), 3000);
  }

  // Validate recipe name input field
  validateName() {
    return this.state.newName.length > 60 ? 'error' : null;
  }

  // Validate recipe ingredients input field
  validateIngredients() {
    const ingredients = this.state.newIngredients;
    return ingredients.length > 500 ||
      (ingredients.length > 10 &&
        ingredients.includes(' ') &&
        !ingredients.includes(','))
      ? 'error'
      : null;
  }

  // Format and save recipe in localStorage
  saveRecipe() {
    // First, check for invalid/empty fields
    if (
      this.validateName() ||
      this.validateIngredients() ||
      !this.state.newName.trim().length ||
      !this.state.newIngredients.trim().length
    ) {
      return this.showAlert();
    }

    // Format new recipe
    const newRecipe = this.capitalizePhrase(this.state.newName);
    // Get current recipes from localStorage
    const currentRecipes =
      JSON.parse(localStorage.getItem('rvrvrv-recipes')) || {};
    // Check if new recipe already exists
    if (currentRecipes.hasOwnProperty(newRecipe)) {
      return this.showAlert(`A recipe for ${newRecipe} already exists.`);
    }
    // If recipe is truly new, add it to the list
    currentRecipes[newRecipe] = this.extractWords(this.state.newIngredients);
    // Update localStorage and state of parent
    localStorage.setItem('rvrvrv-recipes', JSON.stringify(currentRecipes));
    this.props.onSave();
  }

  handleNameChange(e) {
    this.setState({ newName: e.target.value });
  }

  handleIngredientsChange(e) {
    this.setState({ newIngredients: e.target.value });
  }

  render() {
    return (
      <div>
        <form>
          <FormGroup controlId="name" validationState={this.validateName()}>
            <ControlLabel>Recipe for:</ControlLabel>
            <FormControl
              placeholder="Lasagna"
              value={this.state.newName}
              onChange={this.handleNameChange.bind(this)}
            />
          </FormGroup>
          <FormGroup
            controlId="ingredients"
            validationState={this.validateIngredients()}
          >
            <ControlLabel>Ingredients (separated by commas):</ControlLabel>
            <FormControl
              componentClass="textarea"
              placeholder="Pasta, Ricotta Cheese, Garlic..."
              value={this.state.newIngredients}
              onChange={this.handleIngredientsChange.bind(this)}
            />
          </FormGroup>
          <Button bsStyle="success" onClick={this.saveRecipe.bind(this)}>
            Save
          </Button>
          {this.state.alert}
        </form>
      </div>
    );
  }
}

// Inner content of each recipe
class RecipeBody extends React.Component {
  constructor() {
    super();
    this.state = {
      deleteModal: false,
      editModal: false,
    };
  }

  // Open the edit or delete modal
  openModal(e) {
    this.setState({ [e.target.value]: true });
  }

  // Close the edit or delete modal
  closeModal(e) {
    this.setState({ [e.target.value]: false });
  }

  // Delete the recipe
  deleteRecipe() {
    // Get all recipes from localStorage
    const currentRecipes = JSON.parse(localStorage.getItem('rvrvrv-recipes'));
    // Delete the recipe
    delete currentRecipes[this.props.name];
    // Update localStorage and state of parent
    localStorage.setItem('rvrvrv-recipes', JSON.stringify(currentRecipes));
    this.props.onSave();
    // Close the modal
    this.closeModal({ target: { value: 'deleteModal' } });
  }

  render() {
    // Generate list of ingredients
    const ingredientList = this.props.ingredients.map(item => (
      <ListGroupItem
        href={`https://google.com/search?q=${item}`}
        target="_blank"
      >
        {item}
      </ListGroupItem>
    ));

    return (
      <div>
        <h3 className="text-center">{this.props.name}</h3>
        <ListGroup>
          {ingredientList}
        </ListGroup>
        <div className="text-center">
          <Button onClick={this.openModal.bind(this)} value="editModal">
            Edit Recipe
          </Button>
          {' '}
          <Button onClick={this.openModal.bind(this)} value="deleteModal">
            Remove Recipe
          </Button>
        </div>
        <Modal
          show={this.state.deleteModal}
          onHide={this.closeModal.bind(this)}

        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title">
              Remove {this.props.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to remove the recipe for {this.props.name}?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.deleteRecipe.bind(this)} value="deleteModal" bsStyle="danger">
              Yes, remove it
            </Button>
            <Button onClick={this.closeModal.bind(this)} value="deleteModal">
              No
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class RecipeBook extends React.Component {
  // Generate tabs in recipe book
  recipeTabs() {
    return Object.keys(this.props.recipes).map((item, i) => (
      <Tab eventKey={item} title={item}>
        <RecipeBody
          name={item}
          ingredients={this.props.recipes[item]}
          onSave={this.props.onSave.bind(this)}
        />
      </Tab>
    ));
  }

  render() {
    return (
      <Well>
        <Tabs defaultActiveKey="Salad">
          {this.recipeTabs()}
          <Tab eventKey="add-recipe" title="Add a Recipe">
            <NewRecipe onSave={this.props.onSave.bind(this)} />
          </Tab>
        </Tabs>
      </Well>
    );
  }
}

class RecipeContainer extends React.Component {
  constructor() {
    super();
    const sampleRecipes = {
      Salad: ['Lettuce', 'Carrots', 'Minced Garlic', 'Oil and Vinegar'],
      'Hot Dog': ['Meat', 'Buns', 'Ketchup', 'Celery Salt'],
    };
    // First, check for saved recipes. If none exist, load samples.
    if (!localStorage.getItem('rvrvrv-recipes') || localStorage.getItem('rvrvrv-recipes') === '{}') {
      localStorage.setItem('rvrvrv-recipes', JSON.stringify(sampleRecipes));
    }

    this.state = {
      recipes: JSON.parse(localStorage.getItem('rvrvrv-recipes')),
    };
  }

  // Update recipes
  updateRecipes() {
    console.log('Updating the recipe book...');
    this.setState({
      recipes: JSON.parse(localStorage.getItem('rvrvrv-recipes')),
    });
  }

  render() {
    return (
      <RecipeBook
        recipes={this.state.recipes}
        onSave={this.updateRecipes.bind(this)}
      />
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <h1 className="text-center text-success">
          <i className="fa fa-cutlery" aria-hidden="true" /><br />Recipe Book
        </h1>
        <RecipeContainer />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
