import Universe from "@/components/spatial/universe";
import { profile, socialLinks, seo } from "@/data/profile";
export default function Home(){
 const data={"@context":"https://schema.org","@type":"Person",name:profile.name,url:seo.siteUrl,description:profile.heroSubline,email:profile.email,jobTitle:profile.role,sameAs:socialLinks.filter(l=>l.url.startsWith("https")).map(l=>l.url)};
 return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/><Universe/></main>;
}
