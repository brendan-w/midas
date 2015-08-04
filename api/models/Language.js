/**
 * Language
 *
 * @module      :: Model
 * @description :: Stores each of the users languages, as well as
 *                 tags for their written and spoken proficiency.
 *
 */
module.exports = {

  attributes: {

    //the ID of the user
    user: {
      model: 'User',
      required: true,
    },

    //the name of the language
    language: {
      type: 'STRING',
      required: true,
    },

    //the tag for the written proficiency
    writtenProficiency: {
      model: 'TagEntity',
      required: true,
    },

    //the tag for the spoken proficiency
    spokenProficiency: {
      model: 'TagEntity',
      required: true,
    },

  },

};
