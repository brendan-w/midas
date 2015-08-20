/**
 * Attachment
 *
 * @module      :: Model
 * @description :: A mapping between files and projects/tasks to
 *                 form a list of attachments.
 *
 */

module.exports = {

  attributes: {
    // reference to the file that has been attached
    file: {
      model: 'File',
      required: true,
    },

    // Select ONE of project or task, to associate this attachment
    // with that project or task
    projectId: 'INTEGER',
    taskId: 'INTEGER',
    userId: 'INTEGER',
    applicationId: 'INTEGER',
  }

};
