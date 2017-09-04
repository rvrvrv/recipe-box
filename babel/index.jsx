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
  constructor(props) {
    super(props);
    this.state = {
      newName: '',
      newIngredients: '',
      editing: null,
    };
  }

  // Automatically populate fields when editing a recipe
  componentWillReceiveProps(nextProps) {
    if (nextProps.editing) {
      this.setState({
        newName: nextProps.editing.name,
        newIngredients: nextProps.editing.ingredients.join(', '),
        editing: true,
      });
    }
  }

  // Capitalize all appropriate words in a phrase
  capitalizePhrase(str) {
    // regEx to prevent incorrect capitalization
    const regExWords = /(and|the|tsp|oz)/gi;
    return (
      str
        // Trim and split string into array of words
        .trim()
        .split(' ')
        /* Only capitalize first word and longer words, also using regEx
        to prevent incorrectly capitalizing certain words */
        .map(
          (word, i) =>
            ((i === 0 && word) || (word.length > 2 && !regExWords.test(word))
              ? (word = word[0].toUpperCase() + word.slice(1))
              : word),
        )
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
        // Remove empty entires
        .filter(phrase => phrase.length)
    );
  }

  // Check for valid input (called by validateName and validateIngredients)
  validInput(str) {
    const regExLetters = /[a-z]/gi;
    const regExChars = /[<>{}`\\]/gi;
    return !str.length || (regExLetters.test(str) && !regExChars.test(str));
  }

  // Validate recipe name input field
  validateName() {
    const name = this.state.newName;
    return !this.validInput(name) || name.length > 80 ? 'error' : null;
  }

  // Validate recipe ingredients input field
  validateIngredients() {
    const ingredients = this.state.newIngredients;
    return !this.validInput(ingredients) ||
      ingredients.length > 500 ||
      (ingredients.length > 10 &&
        ingredients.includes(' ') &&
        !ingredients.includes(','))
      ? 'error'
      : null;
  }

  // Cancel potential edits
  cancelEdit() {
    // Reset state to clear the form (delayed to prevent flicker)
    setTimeout(
      () => this.setState({ newName: '', newIngredients: '', editing: null }),
      500,
    );
    // Exit editing mode in parent, which will reactivate disabled tabs
    this.props.onExitEditing();
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
      return this.props.onAlert();
    }
    // Format new recipe
    const newRecipe = this.capitalizePhrase(this.state.newName);
    // Get current recipes from localStorage
    const currentRecipes =
      JSON.parse(localStorage.getItem('rvrvrv-recipes')) || {};
    // Check if new recipe already exists (when not editing a recipe)
    if (currentRecipes.hasOwnProperty(newRecipe) && !this.state.editing) {
      return this.props.onAlert(`A recipe for ${newRecipe} already exists.`);
    }
    // Add new/modified recipe to the list
    currentRecipes[newRecipe] = this.extractWords(this.state.newIngredients);
    // Update localStorage and state of parent
    localStorage.setItem('rvrvrv-recipes', JSON.stringify(currentRecipes));
    this.props.onSave();
    // If editing a recipe, exit edit mode
    if (this.state.editing) this.props.onExitEditing();
    // If saving a new recipe, switch to newly created tab
    this.props.onChangeTab(newRecipe);
    // Alert user of successful save/edit, and restore initial state
    this.props.onAlert(
      `Your recipe for ${newRecipe} has been ${this.state.editing ? 'updated' : 'saved'}.`,
      'success',
    );
    this.setState({ newName: '', newIngredients: '', editing: null });
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
        <form style={{ marginTop: 10 }}>
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
          {this.props.editing &&
            <Button onClick={this.cancelEdit.bind(this)}>
              Cancel Changes
            </Button>}
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
    };
  }

  // Open the delete modal
  openModal(e) {
    this.setState({ [e.target.value]: true });
  }

  // Close the delete modal
  closeModal(e) {
    this.setState({ [e.target.value]: false });
  }

  // Load the add-recipe tab with the current recipe
  editRecipe() {
    this.props.onEdit(this.props.name, this.props.ingredients);
  }

  // Delete the recipe
  deleteRecipe() {
    // Get all recipes from localStorage
    const currentRecipes = JSON.parse(localStorage.getItem('rvrvrv-recipes'));
    // Delete the recipe
    delete currentRecipes[this.props.name];
    // Update localStorage
    localStorage.setItem('rvrvrv-recipes', JSON.stringify(currentRecipes));
    // Update parent state
    this.props.onSave();
    // Close the modal and notify the user
    this.closeModal({ target: { value: 'deleteModal' } });
    this.props.onAlert(
      `The recipe for ${this.props.name} has been deleted.`,
      'success',
    );
    // Switch to the add-recipe tab
    this.props.onChangeTab('add-recipe');
  }

  render() {
    // Generate list of ingredients
    const ingredientList = this.props.ingredients.map(item =>
      (<ListGroupItem
        href={`https://google.com/search?q=${item}`}
        target="_blank"
      >
        {item}
      </ListGroupItem>),
    );

    return (
      <div>
        <h3 className="text-center">{this.props.name}</h3>
        <ListGroup>
          {ingredientList}
        </ListGroup>
        <div className="text-center">
          <Button onClick={this.editRecipe.bind(this)}>
            Edit Recipe
          </Button>
          {' '}
          <Button onClick={this.openModal.bind(this)} value="deleteModal">
            Remove Recipe
          </Button>
        </div>
        {/*Delete recipe modal */}
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
            <Button
              onClick={this.deleteRecipe.bind(this)}
              value="deleteModal"
              bsStyle="danger"
            >
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
  constructor() {
    super();
    this.state = {
      alert: null,
      editing: null,
      key: 'add-recipe',
    };
  }

  // Change the active tab (via the key)
  handleSelect(key) {
    this.setState({ key });
  }

  // Populate the add-recipe fields for editing
  handleEdit(name, ingredients) {
    this.setState({
      editing: {
        name,
        ingredients,
      },
    });
    // Switch to the add-recipe tab
    this.handleSelect('add-recipe');
  }

  // Exit editing mode
  handleExitEditing() {
    // Switch back to the chosen recipe tab
    this.handleSelect(this.state.editing.name);
    // Exit editing mode
    this.setState({ editing: null });
  }

  // Display an alert for 3 seconds
  showAlert(
    msg = 'Please enter a valid recipe name and ingredients.',
    style = 'danger',
  ) {
    this.setState({
      alert: (
        <Alert bsStyle={style}>
          <strong>
            {(style === 'danger' && 'Oops!') ||
              (style === 'success' && 'Success!')}
            {' '}
          </strong>
          {msg}
        </Alert>
      ),
    });
    setTimeout(() => this.setState({ alert: null }), 3000);
  }

  // Generate tabs in recipe book
  recipeTabs() {
    return Object.keys(this.props.recipes).map((item, i) =>
      (<Tab eventKey={item} title={item} disabled={!!this.state.editing}>
        <RecipeBody
          name={item}
          ingredients={this.props.recipes[item]}
          onAlert={this.showAlert.bind(this)}
          onEdit={this.handleEdit.bind(this)}
          onChangeTab={this.handleSelect.bind(this)}
          onSave={this.props.onSave.bind(this)}
        />
      </Tab>),
    );
  }

  render() {
    return (
      <div>
        <Well>
          <Tabs
            activeKey={this.state.key}
            onSelect={this.handleSelect.bind(this)}
          >
            {this.recipeTabs()}
            <Tab
              eventKey="add-recipe"
              title={
                this.state.editing
                  ? `Edit ${this.state.editing.name}`
                  : 'Add a Recipe'
              }
            >
              <NewRecipe
                onAlert={this.showAlert.bind(this)}
                onChangeTab={this.handleSelect.bind(this)}
                onSave={this.props.onSave.bind(this)}
                onExitEditing={this.handleExitEditing.bind(this)}
                editing={this.state.editing}
              />
            </Tab>
          </Tabs>
        </Well>
        {this.state.alert}
      </div>
    );
  }
}

class RecipeBookContainer extends React.Component {
  constructor() {
    super();
    const sampleRecipes = {
      'Green Smoothie': [
        '1 Handful Spinach',
        '1 Frozen Banana',
        '½ Small Avocado',
        '¼ Cup Unsweetened Almond Milk',
        '½ tsp. Cinnamon',
      ],
      'Hot Cocoa': [
        '2 Tbsp. Unsweetened Cocoa Powder',
        '1½ Tbsp. Sugar',
        'Pinch of Salt',
        '1 Cup of Milk',
        '¼ tsp. Vanilla Extract',
      ],
    };
    // First, check for saved recipes. If none exist, load samples.
    if (
      !localStorage.getItem('rvrvrv-recipes') ||
      localStorage.getItem('rvrvrv-recipes') === '{}'
    ) {
      localStorage.setItem('rvrvrv-recipes', JSON.stringify(sampleRecipes));
    }

    this.state = {
      recipes: JSON.parse(localStorage.getItem('rvrvrv-recipes')),
    };
  }

  // Update recipes
  updateRecipes() {
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
        <RecipeBookContainer />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
