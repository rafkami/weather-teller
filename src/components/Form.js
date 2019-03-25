import React from "react";
import "../styles/Form.css";
import Autosuggest from "react-autosuggest";

const Form = props => {
  return (
    <div className="search-wrapper">
      <form onSubmit={props.submit}>
        <Autosuggest
          suggestions={props.suggestions}
          onSuggestionsFetchRequested={props.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={props.onSuggestionsClearRequested}
          getSuggestionValue={props.getSuggestionValue}
          renderSuggestion={props.renderSuggestion}
          inputProps={{
            placeholder: "provide city name",
            value: props.value,
            onChange: props.change
          }}
        />
        <button>Search</button>
      </form>
    </div>
  );
};

export default Form;
