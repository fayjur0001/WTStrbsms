import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import { redirect } from "next/navigation";
import Client from "./_components";
import getServices from "./_components/components/proxies/utils/get-services";

export const metadata = {
  title: "Proxy Lease",
};

export default async function Page() {
  const auth = getAuth();
  if (!(await auth.verify([]))) return redirect("/");

  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const services = await getServices(user, apiKey);
  const prices = {
    shared: await SiteOptions.sharedProxyPrice.get(),
    exclusive: await SiteOptions.exclusiveProxyPrice.get(),
  };

  const adminCut = {
    shared: {
      day: await SiteOptions.transactionCut.Proxy.shared.day.get(),
      week: await SiteOptions.transactionCut.Proxy.shared.week.get(),
      month: await SiteOptions.transactionCut.Proxy.shared.month.get(),
    },
    exclusive: {
      day: await SiteOptions.transactionCut.Proxy.exclusive.day.get(),
      week: await SiteOptions.transactionCut.Proxy.exclusive.week.get(),
      month: await SiteOptions.transactionCut.Proxy.exclusive.month.get(),
    },
  };

  return <Client adminCut={adminCut} services={services} prices={prices} />;
}
