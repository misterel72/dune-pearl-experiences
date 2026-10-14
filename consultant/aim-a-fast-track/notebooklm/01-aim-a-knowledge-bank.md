# BTEC International Level 3 IT | Unit 1 | Learning Aim A
## Student knowledge bank | NIS Lagoon | October 2026
**Purpose:** Teach, revisit and apply the full breadth of infrastructure knowledge before an independent assessment. This is an original revision resource, not a Pearson set assignment or a worked response to one. All Dune & Pearl information is fictional.

## Our way of thinking
For every infrastructure choice, connect **business task -> stakeholder -> requirement -> feasible IT option -> benefit -> limitation/risk -> evidence to check -> reasoned decision**. A product name is never a justification. Distinguish a supplied fact from an assumption. If cost, coverage or workload is unknown, say what should be measured or tested.

## A1 | Why organisations need infrastructure
An organisation delivers products, services or both. Its functions may include customer service, finance, HR, marketing, operations, purchasing and management. Each function uses people, processes and information. IT infrastructure is the connected set of devices, software, networks, connections and services supporting those functions.
- **Requirement:** what the system must do. Example: "guides must receive current arrival lists outdoors".
- **Constraint:** a condition restricting the solution. Example: connectivity at a remote camp is unreliable.
- **Stakeholder:** anyone affected, including customers, workers, managers, owners, suppliers and service providers.
- **Success measure:** observable evidence such as time to check in 20 guests, system uptime or a reduction in duplicate records.
- **Fact / assumption:** "two systems hold a guest's details" is a stated fact; "staff require more expensive computers" is an untested assumption.
**Dune & Pearl application:** The three locations need consistent guest information, but may not have identical requirements. A solution useful to finance may be unsuitable for a guide working away from reliable Wi-Fi.
**Decision test:** Who performs the task, where, using which data, and what happens if the system fails?

## A2 | Digital devices
**Desktop PC:** good ergonomics, reliable office use and multiple monitors; lacks portability. **Laptop:** portable with keyboard and full applications; needs charging and device management. **Tablet:** mobile, intuitive touch input and camera; may be fragile or awkward for intensive typing. **Smartphone:** communications, GPS, mobile payments and notifications; limited screen and battery. **Server:** provides shared applications, identity, storage or hosting; could be on-site, cloud-hosted or virtualised. **Specialist devices:** handheld terminals, barcode scanners, RFID readers, cameras, sensors and wearables may support specific workflows.
Compare processing requirements, battery, ruggedness, access needs, screen size, interoperability, cost, accessibility, security, repair and replacement.
**Example:** A marina check-in tablet may reduce queue movement, but needs a secure login, protection from saltwater, connectivity tests and a contingency when offline.
**Common error:** listing hardware without showing which specific worker and task it supports.

## A3 | Peripherals, storage and access
**Input:** keyboard, mouse, touchscreen, camera, microphone, scanner, barcode/RFID reader, sensor. **Output:** monitor, speaker, printer, display and accessible alerts. **Storage:** internal SSD, network storage and cloud storage; assess capacity, speed, resilience, access and cost. **Assistive technology:** screen readers, magnification, alternative input devices, adjustable interfaces and accessible document design.
A payment terminal may need a provider-managed connection, staff permissions, receipts and transaction reconciliation. A shared printer may save cost, but poor access control could expose booking information.
**Decision test:** Is the peripheral compatible with the chosen device, software, connection and user?

## A4 | Operating systems, applications, utilities and file types
An **operating system** manages memory, processes, storage, devices, accounts and interfaces. Evaluate supported applications, security updates, user familiarity, accessibility and compatibility before migration.
**Application software:** booking platform, finance/payroll, CRM, office productivity, scheduling, communications and point-of-sale. **Utilities:** endpoint protection, backup, updates, monitoring, compression and file maintenance.
**Deployment:** local application, browser-based software or hybrid; subscription versus outright licence; vendor support, export options, integration APIs, training and service continuity. A system that cannot exchange booking information may perpetuate duplicate entry.
**File formats:** CSV is useful for structured interchange but may lose styling and data types; PDF preserves a final layout but is less editable; common image formats differ in size/quality and transparency. Record format requirements for suppliers and accessibility.
**Decision test:** What happens when the subscription stops, an app is unavailable, or a supplier changes?

## A5 | Ways to connect devices
**Ethernet:** usually reliable and low latency where fixed cabling is practical. **Wi-Fi:** mobility and convenient shared access, but performance varies with distance, interference, building materials, congestion and configuration. **Bluetooth:** short-range links such as a headset or peripheral, not a substitute for wide-area connectivity. **USB:** direct peripheral/data connection, with limitations from physical access, connectors and permitted device policies. **Mobile broadband (4G/5G):** useful for guides outdoors or a backup route, subject to coverage, data allowances and signal.
Compare bandwidth, latency, coverage, reliability, security, scalability and ongoing costs. Wi-Fi and internet access are different: a connected local Wi-Fi network may still have no internet.
**Decision test:** Where is the user at the moment the information is needed, and what is the fallback?

## A6 | Networks, topology and services
A **LAN** links devices within a site; a **WAN** links sites over greater distances. **Switch:** joins local wired devices. **Wireless access point:** provides Wi-Fi to a wired network. **Router:** forwards traffic between networks; a **firewall** filters traffic using rules. **Server and cloud services:** may deliver shared files, applications, authentication or managed data. DNS translates hostnames to addresses; DHCP typically assigns network configuration.
A **star topology** uses central switching/access equipment and makes faults easier to isolate, but a failed central device affects connected users. Separate business systems from guest Wi-Fi, consider device authentication, guest access, backup links and monitoring.
A diagram should label devices, connection types, users, data flows and any link to another site/cloud. A diagram without a clear purpose is decoration.
**Decision test:** How would a failure or unauthorised connection affect employees and customers?

## A7 | Data transmission and performance
**Bandwidth** measures theoretical carrying capacity; **throughput** is the actual useful data delivered. **Latency** is delay, important for real-time applications. **Packet loss** causes retries and disrupted calls; **jitter** is variation in delay. A 100 Mb/s link may still perform badly with congestion, weak wireless signals or slow services.
Data is typically broken into packets and reassembled at the destination. **TCP** provides reliable, ordered delivery; **UDP** can suit time-sensitive traffic where lower overhead matters. **IP** supports addressing and routing; **HTTPS** protects web communication in transit using TLS. Distinguish encryption from reliability or proof that an entry is correct.
**Compression:** lossless retains original data on reconstruction (text/document transfer); lossy reduces file size by removing some detail (streaming image/audio/video). Both can save transfer time where suitable.
**Example:** Guides sending small booking updates need reliability and resilience more than headline download speed. Test actual performance at busy times and throughout the route.
**Decision test:** Is the problem bandwidth, latency, coverage, application performance or a poor workflow?

## A8 | Online and cloud services
**On-site systems:** more local control and potential local operation, but equipment, security, maintenance, power and disaster recovery remain the organisation's responsibility. **Cloud services:** accessible across locations, can scale and reduce in-house infrastructure work; depend on access and supplier performance, data-protection arrangements, subscription costs and appropriate identity/security controls. **Hybrid:** combines local capabilities with online synchronisation.
Cloud is not automatically more secure or more reliable. Consider uptime commitments, backups, restoration testing, permissions, multifactor authentication, integration, provider lock-in, region/jurisdiction and how systems work during an outage.
**Offline-first:** keep only the minimum appropriate information available locally under controlled access; reconcile changes safely after reconnecting to avoid duplicates and conflicts.
**Decision test:** Which service must continue even when the internet is unavailable?

## A9 | Emerging technologies with business purpose
Examples include **IoT sensors** (equipment or environmental monitoring), **GPS/location services** (safety and logistics), **AI-assisted support** (drafting replies or categorising enquiries), **automation** (routine confirmations), **RFID** (equipment tracking), **AR/VR** (visitor experiences or training) and connected wearables.
Evaluate tangible benefit, data quality, implementation cost, accessibility, privacy, security, maintenance, training and evidence from a realistic pilot. AI output requires human verification; GPS tracking of staff requires a proportionate, transparent policy; connected sensors expand the number of devices requiring updates.
**Decision test:** Is this solving a documented problem or simply sounding impressive?

## Bring it together | Full infrastructure decisions
Imagine Dune & Pearl wants guests to check in at the marina and camp while central finance sees accurate sales totals.
Possible integrated approach: role-based booking platform; fixed office PCs; suitable mobile check-in devices; reliable site Wi-Fi; secure mobile connectivity for guides; cloud synchronisation with a carefully designed outage procedure; managed devices; data backup and recovery; a payment integration. This is a **proposal to test**, not a universal correct answer.
Test alternatives against **business fit, cost, security, reliability, usability, scalability, accessibility and disruption**. An attractive option can still be rejected because the risk at a remote site is unacceptable.
**Explain** how a choice meets a task. **Analyse** the connected consequences for people and operations. **Evaluate** benefits against limitations and alternatives, then judge fitness for purpose. **Justify** why the final decision is stronger than realistic alternatives, stating assumptions and missing evidence.

## Glossary for quick recall
Bandwidth: theoretical data transfer capacity. Throughput: achieved useful transfer rate. Latency: transmission delay. Topology: how devices/connections are arranged. LAN: local area network. WAN: wide area network. Access point: Wi-Fi network device. Router: device forwarding traffic between networks. Firewall: traffic control mechanism. SaaS: software delivered as an online service. Hybrid: combination of local and online approaches. Scalability: ability to cope with growth. Interoperability: ability of different systems to exchange/use information. Stakeholder: party affected by a decision. Constraint: factor limiting a solution. Requirement: function/performance needed. Justification: reasoned defence of a choice using evidence and comparison.

## Source and integrity
Original NIS Lagoon revision material based on the Pearson BTEC International Level 3 IT specification, Unit 1, Learning Aim A (Issue 4, March 2024) and the NIS Lagoon Dune & Pearl fictional teaching scenario. Read the specification at https://qualifications.pearson.com/content/dam/pdf/btec-international-level-3/it/specification-and-sample-assessments/btec-international-level-3-it-specification.pdf . This document deliberately excludes the protected Pearson Set Assignment scenario and tasks.
