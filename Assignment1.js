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
    l2.events.forEach(function (l3) {
      db.HistoryAudit.insertOne({
        _id: l2._id,
        events: [
          {
            datetime: l3.datetime,
            activityType: l3.activityType,
            username: l3.username,
            locationId: l3.locationId,
            subscriberId: l3.subscriberId,
            dropshipOrderNumber: l3.dropshipOrderNumber,
          },
        ],
      });
    });
  });
}

//main query
db.getCollection("Equipment")
  .find(filter)
  .forEach(function (doc) {
    //before deleting take backup
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
