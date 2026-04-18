declare module "whois-json" {
  function whois(domain: string): Promise<any>;
  export default whois;
}
