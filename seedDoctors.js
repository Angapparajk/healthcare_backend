const mongoose = require('mongoose');
const Doctor = require('./Schema/doctors');

const doctors = [
  {"name":"Dr. Aditi Sharma","specialization":"Cardiologist","email":"aditi.sharma@example.com","phone":"9876543200","profileImage":"https://via.placeholder.com/150","availability":"Available Today"},
  {"name":"Dr. Rajesh Kumar","specialization":"Dermatologist","email":"rajesh.kumar@example.com","phone":"9876543201","profileImage":"https://via.placeholder.com/150","availability":"Fully Booked"},
  {"name":"Dr. Priya Singh","specialization":"Pediatrician","email":"priya.singh@example.com","phone":"9876543202","profileImage":"https://via.placeholder.com/150","availability":"On Leave"},
  {"name":"Dr. Amit Patel","specialization":"Orthopedic","email":"amit.patel@example.com","phone":"9876543203","profileImage":"https://via.placeholder.com/150","availability":"Available Today"},
  {"name":"Dr. Sneha Verma","specialization":"Gynecologist","email":"sneha.verma@example.com","phone":"9876543204","profileImage":"https://via.placeholder.com/150","availability":"Fully Booked"},
  {"name":"Dr. Karan Mehta","specialization":"ENT Specialist","email":"karan.mehta@example.com","phone":"9876543205","profileImage":"https://via.placeholder.com/150","availability":"On Leave"},
  {"name":"Dr. Ritu Gupta","specialization":"Ophthalmologist","email":"ritu.gupta@example.com","phone":"9876543206","profileImage":"https://via.placeholder.com/150","availability":"Available Today"},
  {"name":"Dr. Sunil Joshi","specialization":"Neurologist","email":"sunil.joshi@example.com","phone":"9876543207","profileImage":"https://via.placeholder.com/150","availability":"Fully Booked"},
  {"name":"Dr. Meena Nair","specialization":"Psychiatrist","email":"meena.nair@example.com","phone":"9876543208","profileImage":"https://via.placeholder.com/150","availability":"On Leave"},
  {"name":"Dr. Anil Kapoor","specialization":"Urologist","email":"anil.kapoor@example.com","phone":"9876543209","profileImage":"https://via.placeholder.com/150","availability":"Available Today"},
  {"name":"Dr. Pooja Sinha","specialization":"Nephrologist","email":"pooja.sinha@example.com","phone":"9876543210","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Deepak Rao","specialization":"Oncologist","email":"deepak.rao@example.com","phone":"9876543211","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Shalini Das","specialization":"Endocrinologist","email":"shalini.das@example.com","phone":"9876543212","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Vikram Singh","specialization":"Pulmonologist","email":"vikram.singh@example.com","phone":"9876543213","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Neha Jain","specialization":"Gastroenterologist","email":"neha.jain@example.com","phone":"9876543214","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Arjun Reddy","specialization":"Rheumatologist","email":"arjun.reddy@example.com","phone":"9876543215","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Kavita Bansal","specialization":"Hematologist","email":"kavita.bansal@example.com","phone":"9876543216","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Manoj Pillai","specialization":"Immunologist","email":"manoj.pillai@example.com","phone":"9876543217","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Swati Rao","specialization":"Allergist","email":"swati.rao@example.com","phone":"9876543218","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Gaurav Yadav","specialization":"General Surgeon","email":"gaurav.yadav@example.com","phone":"9876543219","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Rakesh Soni","specialization":"Plastic Surgeon","email":"rakesh.soni@example.com","phone":"9876543220","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Ananya Roy","specialization":"Vascular Surgeon","email":"ananya.roy@example.com","phone":"9876543221","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Suresh Iyer","specialization":"Thoracic Surgeon","email":"suresh.iyer@example.com","phone":"9876543222","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Preeti Kaur","specialization":"Neurosurgeon","email":"preeti.kaur@example.com","phone":"9876543223","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Ajay Desai","specialization":"Ophthalmic Surgeon","email":"ajay.desai@example.com","phone":"9876543224","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Nisha Menon","specialization":"Oral Surgeon","email":"nisha.menon@example.com","phone":"9876543225","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Tarun Malhotra","specialization":"Maxillofacial Surgeon","email":"tarun.malhotra@example.com","phone":"9876543226","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Bhavna Shah","specialization":"Periodontist","email":"bhavna.shah@example.com","phone":"9876543227","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Yogesh Jain","specialization":"Prosthodontist","email":"yogesh.jain@example.com","phone":"9876543228","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Radhika Rao","specialization":"Orthodontist","email":"radhika.rao@example.com","phone":"9876543229","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Sandeep Singh","specialization":"Anesthesiologist","email":"sandeep.singh@example.com","phone":"9876543230","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Mehul Shah","specialization":"Radiologist","email":"mehul.shah@example.com","phone":"9876543231","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Rina Patel","specialization":"Pathologist","email":"rina.patel@example.com","phone":"9876543232","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Ashok Nair","specialization":"Microbiologist","email":"ashok.nair@example.com","phone":"9876543233","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Pankaj Sethi","specialization":"Forensic Pathologist","email":"pankaj.sethi@example.com","phone":"9876543234","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Shreya Ghosh","specialization":"Geneticist","email":"shreya.ghosh@example.com","phone":"9876543235","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Nitin Saxena","specialization":"Virologist","email":"nitin.saxena@example.com","phone":"9876543236","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Rupal Shah","specialization":"Bacteriologist","email":"rupal.shah@example.com","phone":"9876543237","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Vikas Jain","specialization":"Parasitologist","email":"vikas.jain@example.com","phone":"9876543238","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Sheetal Mehra","specialization":"Mycologist","email":"sheetal.mehra@example.com","phone":"9876543239","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Prakash Rao","specialization":"Immunopathologist","email":"prakash.rao@example.com","phone":"9876543240","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Anupama Sinha","specialization":"Cytopathologist","email":"anupama.sinha@example.com","phone":"9876543241","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Gita Menon","specialization":"Histopathologist","email":"gita.menon@example.com","phone":"9876543242","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Harish Kumar","specialization":"Clinical Biochemist","email":"harish.kumar@example.com","phone":"9876543243","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Ramesh Gupta","specialization":"Clinical Pharmacologist","email":"ramesh.gupta@example.com","phone":"9876543244","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Suman Agarwal","specialization":"Toxicologist","email":"suman.agarwal@example.com","phone":"9876543245","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Vinay Joshi","specialization":"Occupational Therapist","email":"vinay.joshi@example.com","phone":"9876543246","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Shweta Kapoor","specialization":"Physiotherapist","email":"shweta.kapoor@example.com","phone":"9876543247","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Parul Desai","specialization":"Speech Therapist","email":"parul.desai@example.com","phone":"9876543248","profileImage":"https://via.placeholder.com/150"},
  {"name":"Dr. Mohit Bansal","specialization":"Audiologist","email":"mohit.bansal@example.com","phone":"9876543249","profileImage":"https://via.placeholder.com/150"}
];

const MONGODB_URI = 'mongodb+srv://angapparaj:angapparajk@cluster0.mk8xgnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => Doctor.insertMany(doctors))
  .then(() => {
    console.log('Doctors seeded!');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });