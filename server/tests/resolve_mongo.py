import dns.resolver
import sys

def resolve_srv(domain):
    print(f"Resolving SRV records for: {domain}")
    try:
        answers = dns.resolver.resolve('_mongodb._tcp.' + domain, 'SRV')
        for rdata in answers:
            print(f"Host: {rdata.target} Port: {rdata.port}")
    except Exception as e:
        print(f"Error: {e}")

def resolve_txt(domain):
    print(f"\nResolving TXT records for: {domain}")
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in answers:
            print(f"TXT: {rdata.strings}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    domain = 'cluster0.3jo5rkt.mongodb.net'
    # Use Google DNS
    my_resolver = dns.resolver.Resolver()
    my_resolver.nameservers = ['8.8.8.8']
    
    try:
        srv_answers = my_resolver.resolve('_mongodb._tcp.' + domain, 'SRV')
        hosts = []
        for rdata in srv_answers:
            host = str(rdata.target).rstrip('.')
            hosts.append(f"{host}:{rdata.port}")
            print(f"Found Host: {host}:{rdata.port}")
        
        txt_answers = my_resolver.resolve(domain, 'TXT')
        options = ""
        for rdata in txt_answers:
            options = "".join([s.decode() if isinstance(s, bytes) else s for s in rdata.strings])
            print(f"Found Options: {options}")

        if hosts:
            connection_string = f"mongodb://[USER]:[PASS]@{','.join(hosts)}/[DB]?{options}"
            print(f"\nConstructed Connection String Template:")
            print(connection_string)
            
    except Exception as e:
        print(f"DNS Resolution Failed: {e}")
