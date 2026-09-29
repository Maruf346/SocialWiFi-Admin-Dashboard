import SupportResourcePage from "../../../components/support/SupportResourcePage";

const UserResource = () => (
  <SupportResourcePage
    title="User resources"
    resourceCategory="User resources"
    uploadTitle="Upload resource"
    uploadDescription="Select one or more files to add them to the resource list."
    selectAllLabel="Select all resources"
    searchId="resource-search"
    actionId="resource-action"
  />
);

export default UserResource;
