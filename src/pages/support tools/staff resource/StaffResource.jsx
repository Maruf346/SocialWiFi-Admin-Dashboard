import SupportResourcePage from "../../../components/support/SupportResourcePage";

const StaffResource = () => (
  <SupportResourcePage
    title="Staff resources"
    resourceCategory="Staff resources"
    uploadTitle="Upload staff resource"
    uploadDescription="Select files to add them to the staff resource list."
    selectAllLabel="Select all staff resources"
    searchId="staff-resource-search"
    actionId="staff-resource-action"
  />
);

export default StaffResource;
