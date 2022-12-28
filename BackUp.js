var bulkOp1 = db.getCollection("Equipment").initializeOrderedBulkOp();
var bulkOp2 = db.getCollection("History").initializeOrderedBulkOp();

const count1 = 0;

const filter = {
  model: "FRG222",
  secondarySerialNumber: { $exists: false },
  alternateSerialNumber: { $exists: false },
  wanMacAddress: { $exists: false },
  _id: /^MRCC/,
  status: { $ne: "Provisioned" },
};

function insertIntoBackUp(doc) {
  db.Equipment.find({
    _id: doc._id,
  }).forEach(function (l1) {
    count1++;
    db.EquipmentAudit.insertOne({
      _id: l1._id,
      locationId: l1.locationId,
      subscriberId: l1.subscriberId,
      status: l1.status,
      model: l1.model,
      receivedDate: l1.receivedDate,
    });
  });

  db.History.find({
    _id: doc._id,
  }).forEach(function (l2) {
    count1++;
    db.HistoryAudit.insertOne({
      _id: l2._id,
      events: [...l2.events],
    });
  });
}

//main query
db.getCollection("Equipment")
  .find(filter)
  .forEach(function (doc) {
    //back up data
    insertIntoBackUp(doc);

    //delete for collection1
    bulkOp1
      .find({
        _id: doc._id,
      })
      .delete();

    //delete for collection2
    bulkOp2
      .find({
        _id: doc._id,
      })
      .delete();
  });

const log = {
  message: `Total no of collections deleted Count:${count1}`,
};
print(JSON.stringify(log));

// Clean up queues
if (count1 > 0) {
  bulkOp1.execute();
  bulkOp2.execute();
}
