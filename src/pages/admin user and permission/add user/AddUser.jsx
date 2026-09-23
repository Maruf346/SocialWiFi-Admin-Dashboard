import { useNavigate } from "react-router";

const permissionGroups = [
  {
    title: "Admin Users & Permissions",
    items: ["Admin user list", "Add user"],
  },
  {
    title: "Subscription Plans",
    items: ["Plans list / edit / create"],
  },
  {
    title: "Discount Codes / Coupons",
    items: ["List / manage / create"],
  },
  {
    title: "User Account Management",
    items: ["Single", "Teams", "Fleet"],
  },
  {
    title: "Billing, Payments & Refunds",
    items: ["Subscription payments", "Fleet payments", "History", "Expenses"],
  },
  {
    title: "Reporting & Analytics",
    items: ["Revenue metrics"],
  },
  {
    title: "Support Tools",
    items: [
      "User resources",
      "Staff resources",
      // "Email system login",
      "Support tickets",
    ],
  },
  {
    title: "Security, Logging & Compliance",
    items: ["Audit logs", "Data protection"],
  },
];

const AddUser = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full px-2 py-2 text-[#888] md:px-10 md:py-4">
      <h1 className="mx-auto mb-8 max-w-5xl text-xl font-normal text-[#999] md:text-2xl">
        Add admin user
      </h1>

      <form
        className="mx-auto max-w-5xl"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="space-y-2">
          {[
            ["Name:", "Eric Little", "text"],
            ["Email:", "el2609@gmail.com", "email"],
            ["Phone:", "612-123-4567", "tel"],
            ["Role:", "Super Admin", "text"],
          ].map(([label, placeholder, type]) => (
            <div
              key={label}
              className="flex items-center border-b border-[#e5e5e5] pb-2"
            >
              <label className="w-36 px-2 text-xs font-semibold">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                aria-label={label.replace(":", "")}
                className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-600 outline-none focus:border-[#1d2464]"
              />
            </div>
          ))}
        </div>

        <fieldset className="flex border-b border-[#e5e5e5] py-3">
          <legend className="w-36 px-2 text-xs font-semibold">
            Permissions:
          </legend>
          <div className="grid flex-1 grid-cols-1 gap-x-16 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <div key={group.title} className="mb-1">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" />
                  {group.title}
                </label>
                <div className="ml-4">
                  {group.items.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-1 py-0.5 text-xs"
                    >
                      <input type="checkbox" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
          <button
            onClick={() => navigate("/dashboard/admin-user-list")}
            type="submit"
            className="rounded bg-[#1d2464] px-4 py-2 text-xs text-white cursor-pointer"
          >
            ADD
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin-user-list")}
            className="rounded bg-[#1d2464] px-4 py-2 text-xs text-white cursor-pointer"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
